'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Toast } from '../components/Toast';
import { ApiConfig } from '../lib/api';

import { DashboardView } from '../views/DashboardView';
import { CasesView } from '../views/CasesView';
import { CategoriesView } from '../views/CategoriesView';
import { TopicsView } from '../views/TopicsView';
import { AiPromptsView } from '../views/AiPromptsView';
import { LevelsView } from '../views/LevelsView';
import { TariffsView } from '../views/TariffsView';
import { OrdersView } from '../views/OrdersView';
import { PromoCodesView } from '../views/PromoCodesView';
import { PartnersView } from '../views/PartnersView';
import { BannersView } from '../views/BannersView';
import { NotificationsView } from '../views/NotificationsView';
import { CmsView } from '../views/CmsView';
import { AdminsView } from '../views/AdminsView';
import { SettingsView } from '../views/SettingsView';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState('uz');
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setIsLiveApi(ApiConfig.isLiveApi());
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleQuickAddCase = () => {
    setActiveTab('cases');
    showToast("Klinik keyslar bo'limiga o'tildi. '+ Yangi Keys' tugmasini bosing.", 'info');
  };

  const handleQuickAiTest = () => {
    setActiveTab('ai_prompts');
    showToast("AI Prompt muhandisligi va sandbox bo'limiga o'tildi.", 'info');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} onShowToast={showToast} lang={lang} />;
      case 'cases':
        return <CasesView onShowToast={showToast} lang={lang} />;
      case 'categories':
        return <CategoriesView onShowToast={showToast} lang={lang} />;
      case 'topics':
        return <TopicsView onShowToast={showToast} lang={lang} />;
      case 'ai_prompts':
        return <AiPromptsView onShowToast={showToast} lang={lang} />;
      case 'levels':
        return <LevelsView onShowToast={showToast} lang={lang} />;
      case 'tariffs':
        return <TariffsView onShowToast={showToast} lang={lang} />;
      case 'orders':
        return <OrdersView onShowToast={showToast} lang={lang} />;
      case 'promocodes':
        return <PromoCodesView onShowToast={showToast} lang={lang} />;
      case 'partners':
        return <PartnersView onShowToast={showToast} lang={lang} />;
      case 'banners':
        return <BannersView onShowToast={showToast} lang={lang} />;
      case 'notifications':
        return <NotificationsView onShowToast={showToast} lang={lang} />;
      case 'cms':
        return <CmsView onShowToast={showToast} lang={lang} />;
      case 'admins':
        return <AdminsView onShowToast={showToast} lang={lang} />;
      case 'settings':
        return <SettingsView onShowToast={showToast} isLiveApi={isLiveApi} setIsLiveApi={setIsLiveApi} lang={lang} />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} onShowToast={showToast} lang={lang} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          activeTab={activeTab}
          onQuickAddCase={handleQuickAddCase}
          onQuickAiTest={handleQuickAiTest}
          isLiveApi={isLiveApi}
          setIsLiveApi={setIsLiveApi}
          onShowToast={showToast}
        />

        <main style={{ flex: 1, padding: '28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
