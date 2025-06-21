export interface SummarizationRequest {
  content: string;
  prompt?: string;
  model?: string;
  apiKey: string;
}

export interface SummarizationResponse {
  summary: string;
  model: string;
  tokensUsed?: number;
}

export class AISummarizerService {
  private defaultPrompt = `Please provide a concise and comprehensive summary of the following article. Focus on the main points, key insights, and important details. Structure the summary in a clear and readable format:

Article content:
`;

  private defaultModel = 'anthropic/claude-3-haiku';

  async summarizeText({
    content,
    prompt = this.defaultPrompt,
    model = this.defaultModel,
    apiKey
  }: SummarizationRequest): Promise<SummarizationResponse> {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Content is required for summarization');
    }

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
        tokensUsed: data.usage?.total_tokens
      };
    } catch (error) {
      console.error('AI Summarization error:', error);
      throw error instanceof Error ? error : new Error('Failed to summarize content');
    }
  }

  getAvailableModels(): Array<{ id: string; name: string; provider: string }> {
    return [
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)', provider: 'Meta' },
      { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'Google' }
    ];
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey && apiKey.trim().length > 0 && apiKey.startsWith('sk-');
  }
}

export const aiSummarizerService = new AISummarizerService();