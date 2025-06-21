import React, { useState } from 'react';
import { Download, Link, FileText, Edit, Loader, Sparkles } from 'lucide-react';
import { urlToMarkdownService } from '../../services/urlToMarkdown';
import { dbService } from '../../services/database';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import ReactMarkdown from 'react-markdown';

interface ConvertedContent {
  title: string;
  content: string;
  author?: string;
  publishDate?: string;
  summary?: string;
  originalUrl: string;
}

export const URLFetcher: React.FC = () => {
  const { setArticleToSummarize, setActiveTab } = useAppStore();
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedContent, setConvertedContent] = useState<ConvertedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (!url.trim()) return;
    
    try {
      new URL(url); // Validate URL
      setUrls(prev => [...prev, url.trim()]);
      setUrl('');
      setError(null);
    } catch {
      setError('Please enter a valid URL');
    }
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvertUrl = async (urlToConvert: string) => {
    setIsConverting(true);
    setError(null);
    
    try {
      const result = await urlToMarkdownService.convertUrlToMarkdown(urlToConvert);
      setConvertedContent({
        ...result,
        originalUrl: urlToConvert,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to convert URL');
    } finally {
      setIsConverting(false);
    }
  };

  const handleSaveToKnowledge = async () => {
    if (!convertedContent) return;

    try {
      await dbService.addArticle({
        feedId: 'manual',
        title: convertedContent.title,
        content: convertedContent.content,
        summary: convertedContent.summary,
        url: convertedContent.originalUrl,
        author: convertedContent.author,
        publishDate: convertedContent.publishDate 
          ? new Date(convertedContent.publishDate).getTime() 
          : Date.now(),
        isRead: false,
        isFavorite: false,
        tags: ['web-clipping'],
        createdAt: Date.now(),
      });

      alert('Article saved to Knowledge Store!');
      setConvertedContent(null);
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article. Please try again.');
    }
  };

  const handleSendToEditor = () => {
    // TODO: Implement send to editor functionality
    console.log('Send to editor:', convertedContent);
  };

  const handleSendToAI = () => {
    if (!convertedContent) return;
    
    // Create a temporary article object for AI summarization
    const tempArticle = {
      id: 'temp-' + Date.now(),
      feedId: 'manual',
      title: convertedContent.title,
      content: convertedContent.content,
      summary: convertedContent.summary,
      url: convertedContent.originalUrl,
      author: convertedContent.author,
      publishDate: convertedContent.publishDate 
        ? new Date(convertedContent.publishDate).getTime() 
        : Date.now(),
      isRead: false,
      isFavorite: false,
      tags: ['web-clipping'],
      createdAt: Date.now(),
    };
    
    setArticleToSummarize(tempArticle);
    setActiveTab('summarize');
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - URL Input */}
      <div className="w-96 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            URL to Markdown
          </h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter URL to convert..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                icon={Link}
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={handleAddUrl}
                disabled={!url.trim()}
              >
                Add
              </Button>
            </div>
            
            {error && (
              <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            URLs to Convert ({urls.length})
          </h3>
          
          {urls.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Download size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">No URLs added yet</p>
              <p className="text-xs mt-1">Add URLs above to convert them to markdown</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urls.map((urlItem, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Link size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white break-all">
                          {urlItem}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleConvertUrl(urlItem)}
                        disabled={isConverting}
                        loading={isConverting}
                        className="flex-1"
                      >
                        Convert
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUrl(index)}
                        className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
        {convertedContent ? (
          <>
            <div className="border-b border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                    {convertedContent.title}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {convertedContent.author && (
                      <span>{convertedContent.author}</span>
                    )}
                    {convertedContent.publishDate && (
                      <span>{new Date(convertedContent.publishDate).toLocaleDateString()}</span>
                    )}
                    <a 
                      href={convertedContent.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      View Original
                    </a>
                  </div>
                  
                  {convertedContent.summary && (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {convertedContent.summary}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={handleSendToAI}
                >
                  Summarize with AI
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit}
                  onClick={handleSendToEditor}
                >
                  Send to Editor
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  icon={FileText}
                  onClick={handleSaveToKnowledge}
                >
                  Save to Knowledge Store
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {convertedContent.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              {isConverting ? (
                <>
                  <Loader size={48} className="mx-auto mb-4 animate-spin" />
                  <p className="text-lg font-medium mb-2">Converting URL...</p>
                  <p className="text-sm">This may take a few moments</p>
                </>
              ) : (
                <>
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No content to preview</p>
                  <p className="text-sm">Convert a URL to see the markdown preview here</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};