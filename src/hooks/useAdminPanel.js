import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAdminPanel() {
  const [activeTab, setActiveTab] = useState("upload");
  const [bulkData, setBulkData] = useState("");
  const [defaultPrice, setDefaultPrice] = useState(15.0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editingSettings, setEditingSettings] = useState({});
  const [settingsChanged, setSettingsChanged] = useState(false);

  const queryClient = useQueryClient();

  // Data Fetching
  const { data: entriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ["data-entries", searchTerm, statusFilter, formatFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (formatFilter) params.append("format", formatFilter);
      const response = await fetch(`/api/data-entries?${params}`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", userSearchTerm, userStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userSearchTerm) params.append("search", userSearchTerm);
      if (userStatusFilter) params.append("status", userStatusFilter);
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const { data: botSettingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["bot-settings"],
    queryFn: async () => {
      const response = await fetch("/api/bot-settings");
      if (!response.ok) throw new Error("Failed to fetch bot settings");
      return response.json();
    },
  });

  useEffect(() => {
    if (botSettingsData?.settings && Object.keys(editingSettings).length === 0) {
      const initialSettings = {};
      Object.entries(botSettingsData.settings).forEach(([key, data]) => {
        initialSettings[key] = data.value;
      });
      setEditingSettings(initialSettings);
    }
  }, [botSettingsData, editingSettings]);

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/data-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      setUploadSuccess(`Successfully uploaded ${data.entries?.length || 1} entries`);
      setUploadError("");
      setBulkData("");
      queryClient.invalidateQueries({ queryKey: ["data-entries"] });
      setTimeout(() => setUploadSuccess(""), 5000);
    },
    onError: (error) => {
      setUploadError(error.message);
      setUploadSuccess("");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const response = await fetch("/api/bot-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-settings"] });
      setSettingsChanged(false);
    },
  });

  // Event Handlers
  const handleBulkUpload = () => {
    if (!bulkData.trim()) {
      setUploadError("Please enter data to upload");
      return;
    }
    uploadMutation.mutate({
      bulkData: bulkData.trim(),
      defaultPrice: parseFloat(defaultPrice),
    });
  };

  const handleUpdateUser = (user) => {
    updateUserMutation.mutate(user);
  };

  const handleSettingChange = (key, value) => {
    setEditingSettings((prev) => ({ ...prev, [key]: value }));
    setSettingsChanged(true);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(editingSettings);
  };

  // Derived State (Stats)
  const stats = {
    totalEntries: entriesData?.total || 0,
    availableEntries: entriesData?.entries?.filter((e) => e.status === "available").length || 0,
    soldEntries: entriesData?.entries?.filter((e) => e.status === "sold").length || 0,
    totalOrders: ordersData?.orders?.length || 0,
    pendingOrders: ordersData?.orders?.filter((o) => o.payment_status === "pending").length || 0,
    completedOrders: ordersData?.orders?.filter((o) => o.payment_status === "completed").length || 0,
    totalUsers: usersData?.total || 0,
    activeUsers: usersData?.users?.filter((u) => u.status === "active").length || 0,
    totalWalletBalance: usersData?.users?.reduce((sum, u) => sum + parseFloat(u.wallet_balance || 0), 0) || 0,
  };

  return {
    activeTab,
    setActiveTab,
    bulkData,
    setBulkData,
    defaultPrice,
    setDefaultPrice,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    formatFilter,
    setFormatFilter,
    userSearchTerm,
    setUserSearchTerm,
    userStatusFilter,
    setUserStatusFilter,
    uploadSuccess,
    uploadError,
    editingUser,
    setEditingUser,
    editingSettings,
    settingsChanged,
    entriesData,
    entriesLoading,
    ordersData,
    ordersLoading,
    usersData,
    usersLoading,
    botSettingsData,
    settingsLoading,
    uploadMutation,
    updateUserMutation,
    updateSettingsMutation,
    handleBulkUpload,
    handleUpdateUser,
    handleSettingChange,
    handleSaveSettings,
    stats,
  };
}
