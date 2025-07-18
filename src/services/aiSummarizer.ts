export interface SummarizationRequest {
  content: string;
  prompt?: string;
  model: string;
  provider: 'openrouter' | 'gemini';
  apiKey: string;
}

export interface SummarizationResponse {
  summary: string;
  model: string;
  provider: string;
  tokensUsed?: number;
}

export interface SavedPrompt {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
  createdAt: number;
}

export interface AIProvider {
  id: 'openrouter' | 'gemini';
  name: string;
  models: AIModel[];
  apiKeyPrefix: string;
  endpoint: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export class AISummarizerService {
  private defaultPrompt = `Please provide a concise and comprehensive summary of the following article. Focus on the main points, key insights, and important details. Structure the summary in a clear and readable format:

Article content:
`;

  private providers: AIProvider[] = [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      apiKeyPrefix: 'sk-or-',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      models: [
        { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast and efficient' },
        { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'Balanced performance' },
        { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Most capable' },
        { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Latest GPT-4 model' },
        { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Faster and cheaper' },
        { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: 'Fast and affordable' },
        { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)', provider: 'Meta', description: 'Free tier model' },
        { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', description: 'High performance' },
        { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'Google', description: 'Fast responses' },
        { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', description: 'Advanced reasoning' }
      ]
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      apiKeyPrefix: 'AIza',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      models: [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Most capable model' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', description: 'Fast and efficient' },
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Balanced performance' },
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'Google', description: 'Multimodal capabilities' }
      ]
    }
  ];

  async summarizeText({
    content,
    prompt = this.defaultPrompt,
    model,
    provider,
    apiKey
  }: SummarizationRequest): Promise<SummarizationResponse> {
    if (!apiKey) {
      throw new Error(`${provider === 'gemini' ? 'Google API' : 'OpenRouter API'} key is required`);
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Content is required for summarization');
    }

    if (provider === 'gemini') {
      return this.summarizeWithGemini({ content, prompt, model, apiKey });
    } else {
      return this.summarizeWithOpenRouter({ content, prompt, model, apiKey });
    }
  }

  private async summarizeWithOpenRouter({
    content,
    prompt,
    model,
    apiKey
  }: Omit<SummarizationRequest, 'provider'>): Promise<SummarizationResponse> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ReadLater AI Summarizer'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\n${content}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `OpenRouter API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No summary generated');
      }

      const summary = data.choices[0].message?.content;
      if (!summary) {
        throw new Error('Empty summary received');
      }

      return {
        summary: summary.trim(),
        model: model,
        provider: 'openrouter',
        tokensUsed: data.usage?.total_tokens
      };
    } catch (error) {
      console.error('AI Summarization error:', error);
      throw error instanceof Error ? error : new Error('Failed to summarize content');
    }
  }

  private async summarizeWithGemini({
    content,
    prompt,
    model,
    apiKey
  }: Omit<SummarizationRequest, 'provider'>): Promise<SummarizationResponse> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${prompt}\n\n${content}`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `Google Gemini API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No summary generated');
      }

      const summary = data.candidates[0]?.content?.parts?.[0]?.text;
      if (!summary) {
        throw new Error('Empty summary received');
      }

      return {
        summary: summary.trim(),
        model: model,
        provider: 'gemini',
        tokensUsed: data.usageMetadata?.totalTokenCount
      };
    } catch (error) {
      console.error('Google Gemini API error:', error);
      throw error instanceof Error ? error : new Error('Failed to summarize content');
    }
  }

  getProviders(): AIProvider[] {
    return this.providers;
  }

  getModelsByProvider(providerId: 'openrouter' | 'gemini'): AIModel[] {
    const provider = this.providers.find(p => p.id === providerId);
    return provider?.models || [];
  }

  validateApiKey(apiKey: string, provider: 'openrouter' | 'gemini'): boolean {
    if (!apiKey || apiKey.trim().length === 0) return false;
    
    const providerConfig = this.providers.find(p => p.id === provider);
    if (!providerConfig) return false;
    
    return apiKey.startsWith(providerConfig.apiKeyPrefix);
  }

  // Prompt management methods
  getSavedPrompts(): SavedPrompt[] {
    const saved = localStorage.getItem('ai_summarizer_prompts');
    if (!saved) {
      const defaultPrompts: SavedPrompt[] = [
        {
          id: 'default',
          name: 'Default Summary',
          content: this.defaultPrompt,
          isDefault: true,
          createdAt: Date.now()
        },
        {
          id: 'bullet-points',
          name: 'Bullet Points',
          content: 'Please summarize the following article in bullet points, highlighting the key takeaways and main arguments:\n\nArticle content:',
          createdAt: Date.now()
        },
        {
          id: 'executive-summary',
          name: 'Executive Summary',
          content: 'Create an executive summary of the following article, focusing on business implications and actionable insights:\n\nArticle content:',
          createdAt: Date.now()
        }
      ];
      this.savePrompts(defaultPrompts);
      return defaultPrompts;
    }
    return JSON.parse(saved);
  }

  savePrompt(prompt: Omit<SavedPrompt, 'id' | 'createdAt'>): SavedPrompt {
    const prompts = this.getSavedPrompts();
    const newPrompt: SavedPrompt = {
      ...prompt,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    prompts.push(newPrompt);
    this.savePrompts(prompts);
    return newPrompt;
  }

  updatePrompt(id: string, updates: Partial<SavedPrompt>): void {
    const prompts = this.getSavedPrompts();
    const index = prompts.findIndex(p => p.id === id);
    if (index !== -1) {
      prompts[index] = { ...prompts[index], ...updates };
      this.savePrompts(prompts);
    }
  }

  deletePrompt(id: string): void {
    const prompts = this.getSavedPrompts();
    const filtered = prompts.filter(p => p.id !== id && !p.isDefault);
    this.savePrompts(filtered);
  }

  private savePrompts(prompts: SavedPrompt[]): void {
    localStorage.setItem('ai_summarizer_prompts', JSON.stringify(prompts));
  }
}

export const aiSummarizerService = new AISummarizerService();