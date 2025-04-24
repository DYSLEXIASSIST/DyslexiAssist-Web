import { Groq } from 'groq-sdk';

const groq = new Groq();

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();

    // Extract text from image
    const extractionCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this image and format it clearly."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      model: "meta-llama/llama-4-maverick-32k",
      temperature: 0.1,
      max_completion_tokens: 2048,
    });

    const extractedText = extractionCompletion.choices[0].message.content;

    // Check accuracy
    const accuracyCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze the accuracy and confidence of the following extracted text. 
          Consider factors like image quality, text clarity, and potential errors.
          Provide a brief analysis with a confidence score.

          Extracted text:
          ${extractedText}`
        }
      ],
      model: "meta-llama/llama-4-maverick-32k",
      temperature: 0.2,
      max_completion_tokens: 1024,
    });

    return Response.json({
      extractedText,
      accuracyAnalysis: accuracyCompletion.choices[0].message.content
    });
    
  } catch (error) {
    console.error('Text extraction error:', error);
    return Response.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}