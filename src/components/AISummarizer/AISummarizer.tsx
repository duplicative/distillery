import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Save, Settings, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { aiSummarizerService } from '../../services/aiSummarizer';
import { dbService } from '../../services/database';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import ReactMarkdown from 'react-markdown';

export const AISummarizer: React.FC = () => {
  const { articleToSummarize, setActiveTab } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-haiku');
  const [customPrompt, setCustomPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const availableModels = aiSummarizerService.getAvailableModels();

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    const savedModel = localStorage.getItem('ai_summarizer_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleSummarize = async () => {
    if (!articleToSummarize) {
      setError('No article selected for summarization');
      return;
    }

    if (!apiKey) {
      setError('Please enter your OpenRouter API key');
      return;
    }

    if (!aiSummarizerService.validateApiKey(apiKey)) {
      setError('Invalid API key format. OpenRouter API keys should start with "sk-"');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Save API key and model to localStorage
      localStorage.setItem('openrouter_api_key', apiKey);
      localStorage.setItem('ai_summarizer_model', selectedModel);

      const result = await aiSummarizerService.summarizeText({
        content: articleToSummarize.content,
        prompt: customPrompt || undefined,
        model: selectedModel,
        apiKey: apiKey
      });

      setSummary(result.summary);
      setSuccess(`Summary generated successfully using ${result.model}${result.tokensUsed ? ` (${result.tokensUsed} tokens)` : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToKnowledge = async () => {
    if (!summary || !articleToSummarize) return;

    try {
      await dbService.addArticle({
        feedId: 'ai-summary',
        title: `AI Summary: ${articleToSummarize.title}`,
        content: summary,
        summary: `AI-generated summary of "${articleToSummarize.title}"`,
        url: articleToSummarize.url,
        author: `AI (${selectedModel})`,
        publishDate: Date.now(),
        isRead: false,
        isFavorite: false,
        tags: ['ai-summary', 'generated-content'],
        createdAt: Date.now(),
      });

      setSuccess('Summary saved to Knowledge Store!');
      
      // Optionally navigate to Knowledge Store
      setTimeout(() => {
        setActiveTab('store');
      }, 1500);
    } catch (error) {
      console.error('Failed to save summary:', error);
      setError('Failed to save summary to Knowledge Store');
    }
  };

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setSuccess('Summary copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  if (!articleToSummarize) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Bot size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No Article Selected</p>
          <p className="text-sm mb-4">
            Select an article from RSS Reader, URL Fetcher, or Knowledge Store to summarize it with AI
          </p>
          <div className="flex justify-center space-x-2">
            <Button variant="secondary" onClick={() => setActiveTab('rss')}>
              Go to RSS Reader
            </Button>
            <Button variant="secondary" onClick={() => setActiveTab('store')}>
              Go to Knowledge Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      {/* Left Panel - Article */}
      <div className="w-1/2 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                {articleToSummarize.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                {articleToSummarize.author && <span>{articleToSummarize.author}</span>}
                <span>{new Date(articleToSummarize.publishDate).toLocaleDateString()}</span>
                <a
                  href={articleToSummarize.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <ExternalLink size={14} />
                  <span>Original</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown>{articleToSummarize.content}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Summarizer */}
      <div className="w-1/2 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Sparkles className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Summarizer
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate intelligent summaries using AI
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              icon={Settings}
              onClick={() => setShowSettings(!showSettings)}
            />
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <Card className="mb-4">
              <CardHeader>
                <h3 className="font-medium text-gray-900 dark:text-white">Configuration</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="OpenRouter API Key"
                  type="password"
                  placeholder="sk-or-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="input-field"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Prompt (Optional)
                  </label>
                  <textarea
                    placeholder="Enter custom summarization instructions..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              onClick={handleSummarize}
              loading={isLoading}
              disabled={!apiKey}
              icon={Sparkles}
            >
              {isLoading ? 'Generating Summary...' : 'Summarize with AI'}
            </Button>
            
            {summary && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Copy}
                  onClick={handleCopySummary}
                >
                  Copy
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Save}
                  onClick={handleSaveToKnowledge}
                >
                  Save to Knowledge Store
                </Button>
              </>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center space-x-2">
              <AlertCircle size={16} className="text-error-600 dark:text-error-400" />
              <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex items-center space-x-2">
              <CheckCircle size={16} className="text-success-600 dark:text-success-400" />
              <p className="text-sm text-success-700 dark:text-success-300">{success}</p>
            </div>
          )}
        </div>

        {/* Summary Display */}
        <div className="flex-1 overflow-y-auto p-6">
          {summary ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Generated Summary</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Model: {availableModels.find(m => m.id === selectedModel)?.name}
                </span>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Ready to Summarize</p>
                <p className="text-sm">
                  {!apiKey 
                    ? 'Enter your OpenRouter API key and click "Summarize with AI"'
                    : 'Click "Summarize with AI" to generate an intelligent summary'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};