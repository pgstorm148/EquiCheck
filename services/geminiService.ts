import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, DiscrepancySeverity } from "../types";

// Define the expected output schema for structured JSON response
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: "A high-level summary of the comparison, specifically mentioning the verdict (Pass/Kill)." },
    riskScore: { type: Type.NUMBER, description: "A calculated risk score from 0 to 100. 100 means extreme risk/deal breaker." },
    agreementScore: { type: Type.NUMBER, description: "A calculated score from 0 to 100 indicating how much the documents agree." },
    strategicAlignment: { type: Type.STRING, description: "Analysis of whether the strategic visions in both documents align." },
    keyRisks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of top 3-5 key risks identified (e.g., 'Artificial EBITDA inflation', 'Undisclosed Legal Action')."
    },
    discrepancies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Must be one of: 'Financial Projections', 'Market Sizing', 'Risk Disclosures', 'Operational', 'Legal'." },
          topic: { type: Type.STRING, description: "The specific topic (e.g., 'EBITDA FY25', 'China Supply Chain')." },
          buySideClaim: { type: Type.STRING, description: "Exact extraction of the finding from the Buy Side Report." },
          sellSideClaim: { type: Type.STRING, description: "Exact extraction of the claim from the Sell Side Memo." },
          severity: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
          reasoning: { type: Type.STRING, description: "Brief explanation of why this is a discrepancy and its impact on valuation." }
        },
        required: ["category", "topic", "buySideClaim", "sellSideClaim", "severity", "reasoning"]
      }
    }
  },
  required: ["executiveSummary", "riskScore", "agreementScore", "strategicAlignment", "keyRisks", "discrepancies"]
};

export const analyzeDocuments = async (
  buySideBase64: string,
  sellSideBase64: string,
  buySideName: string,
  sellSideName: string
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Configuration Error: API_KEY is missing via process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are an expert Senior Investment Analyst working for a Private Equity firm. 
    Your task is to rigorously compare a 'Buy Side' due diligence report against a 'Sell Side' information memorandum.
    
    CORE OBJECTIVE:
    Identify material discrepancies between what the Seller is promising (Sell Side) and what the internal diligence team has found (Buy Side).
    
    REQUIRED EXTRACTION LOGIC:
    
    1. FINANCIAL PROJECTIONS (The "Numbers"):
       - Extract Revenue and EBITDA claims from both documents.
       - Compare Growth Rates (CAGR) and Profit Margins.
       - CRITICAL: Identify "Adjusted EBITDA" add-backs or "One-time" gains that the Sell Side uses to inflate numbers (e.g., "Fair Value Adjustments").
    
    2. MARKET SIZING (The "Story"):
       - Compare the Total Addressable Market (TAM) definitions.
       - Look for contradictions in market growth rates or geographic scope (e.g., "Global" vs "Regional").
    
    3. RISK DISCLOSURES (The "Gotchas"):
       - Extract specific risks (Supply Chain, Legal, Regulatory) found in the Buy Side report.
       - Verify if these are disclosed, downplayed, or omitted in the Sell Side memo.
       - Example: If Buy Side mentions "Single Source Dependency," does Sell Side claim "Global Diversification"?
    
    OUTPUT FORMAT:
    Return the analysis in strict JSON format matching the schema provided. 
    Classify every discrepancy with a severity level (Low, Medium, High, Critical).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Very low temperature for maximum analytical rigour
      },
      contents: {
        parts: [
          { text: `Document 1: Buy Side Report (${buySideName})` },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: buySideBase64,
            },
          },
          { text: `Document 2: Sell Side Report (${sellSideName})` },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: sellSideBase64,
            },
          },
          { text: "Compare these two documents and generate the analysis." }
        ],
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("The AI model returned an empty response. Please try again.");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(textResponse);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      throw new Error("Failed to parse AI analysis. The model output was not valid JSON.");
    }

    const result: AnalysisResult = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      buySideFileName: buySideName,
      sellSideFileName: sellSideName,
      ...parsedData
    };

    return result;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // Granular Error Handling
    if (error.message.includes("403")) {
      throw new Error("Access Denied: Invalid API Key or Permissions.");
    }
    if (error.message.includes("429")) {
      throw new Error("Rate Limit Exceeded: The service is currently busy. Please try again in a moment.");
    }
    if (error.message.includes("503") || error.message.includes("500")) {
      throw new Error("Service Unavailable: Google Gemini API is experiencing issues.");
    }
    if (error instanceof SyntaxError) {
        throw new Error("Format Error: The AI response could not be parsed.");
    }

    // Default Error
    throw new Error(error.message || "An unexpected error occurred during document analysis.");
  }
};