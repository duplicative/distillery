import React, { useEffect } from 'react';
import { Layout } from './components/Layout/Layout';
import { RSSReader } from './components/RSSReader/RSSReader';
import { URLFetcher } from './components/URLFetcher/URLFetcher';
import { NotesEditor } from './components/NotesEditor/NotesEditor';
import { KnowledgeStore } from './components/KnowledgeStore/KnowledgeStore';
import { useAppStore } from './store/appStore';

function App() {
  const { activeTab } = useAppStore();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'rss':
        return <RSSReader />;
      case 'fetch':
        return <URLFetcher />;
      case 'editor':
        return <NotesEditor />;
      case 'store':
        return <KnowledgeStore />;
      default:
        return <RSSReader />;
    }
  };

  return (
    <Layout>
      {renderActiveTab()}
    </Layout>
  );
}

export default App;