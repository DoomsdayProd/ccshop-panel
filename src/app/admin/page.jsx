"use client";

import { useAdminPanel } from "../../hooks/useAdminPanel";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { StatsOverview } from "../../components/admin/StatsOverview";
import { TabNavigation } from "../../components/admin/TabNavigation";
import { RealTimeStats } from "../../components/admin/RealTimeStats";
import { UploadTab } from "../../components/admin/tabs/UploadTab";
import { ManageListingsTab } from "../../components/admin/tabs/ManageListingsTab";
import { OrdersTab } from "../../components/admin/tabs/OrdersTab";
import { UserManagementTab } from "../../components/admin/tabs/UserManagementTab";
import { BotSettingsTab } from "../../components/admin/tabs/BotSettingsTab";
import { UserEditModal } from "../../components/admin/UserEditModal";
import { GlobalAdminStyles } from "../../components/admin/GlobalAdminStyles";

export default function AdminPanel() {
  const {
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
  } = useAdminPanel();

  const renderTabContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <UploadTab
            defaultPrice={defaultPrice}
            setDefaultPrice={setDefaultPrice}
            bulkData={bulkData}
            setBulkData={setBulkData}
            handleBulkUpload={handleBulkUpload}
            uploadMutation={uploadMutation}
            uploadSuccess={uploadSuccess}
            uploadError={uploadError}
          />
        );
      case "manage":
        return (
          <ManageListingsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            formatFilter={formatFilter}
            setFormatFilter={setFormatFilter}
            entriesData={entriesData}
            isLoading={entriesLoading}
          />
        );
      case "orders":
        return <OrdersTab ordersData={ordersData} />;
      case "users":
        return (
          <UserManagementTab
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            userStatusFilter={userStatusFilter}
            setUserStatusFilter={setUserStatusFilter}
            usersData={usersData}
            usersLoading={usersLoading}
            setEditingUser={setEditingUser}
          />
        );
      case "settings":
        return (
          <BotSettingsTab
            botSettingsData={botSettingsData}
            settingsLoading={settingsLoading}
            editingSettings={editingSettings}
            handleSettingChange={handleSettingChange}
            settingsChanged={settingsChanged}
            handleSaveSettings={handleSaveSettings}
            updateSettingsMutation={updateSettingsMutation}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05151B] to-[#E9ECEF] dark:from-[#0A0A0A] dark:to-[#1E1E1E]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-8">
        <StatsOverview stats={stats} />
        
        {/* Real-Time Dashboard */}
        <div className="mt-8">
          <RealTimeStats />
        </div>
        
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/10">
          {renderTabContent()}
        </div>
      </div>
      <UserEditModal
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        handleUpdateUser={handleUpdateUser}
        updateUserMutation={updateUserMutation}
      />
      <GlobalAdminStyles />
    </div>
  );
}
