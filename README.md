# EquiCheck - Intelligent Deal Analytics

EquiCheck is an AI-powered investment agent designed to automate the comparison between Buy-Side Due Diligence reports and Sell-Side Information Memorandums. It leverages Google Gemini 1.5 Flash to identify discrepancies, risks, and strategic misalignments.

## System Architecture

The application is built using a modern, serverless architecture on Google Cloud Platform.

```mermaid
graph TD
    User((Analyst)) --> |Access| UI[React Frontend\n(Cloud Run)]
    UI --> |Upload| Gemini[Vertex AI\n(Gemini 1.5 Flash)]
    Gemini --> |Analysis| UI
    UI --> |Persist| DB[(Firestore)]
```

### Components

1.  **Frontend**: 
    *   Built with React, Vite, and Tailwind CSS.
    *   Hosted on **Google Cloud Run** via a Node.js container.
    *   Handles file processing (PDF to Base64) entirely client-side.

2.  **AI Engine**:
    *   **Model**: Gemini 2.5 Flash (via Vertex AI / `@google/genai` SDK).
    *   **Task**: Multimodal analysis (Text + PDF) with structured JSON output.

3.  **Database**:
    *   **Google Cloud Firestore**: Stores analysis results (JSON) for historical auditing.

## Deployment Guide

### Prerequisites
*   Google Cloud Project with Billing Enabled.
*   APIs Enabled: Vertex AI, Cloud Run, Cloud Build, Firestore.
*   Firebase Project linked to GCP Project.

### Steps

1.  **Configure Firebase**:
    *   Create a Web App in Firebase Console.
    *   Update `services/firebase.ts` with your config keys.

2.  **Deploy to Cloud Run**:
    ```bash
    gcloud run deploy equicheck-app \
      --source . \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars API_KEY=YOUR_GEMINI_API_KEY
    ```

## Features
*   **Drag-and-Drop Interface**: Easy upload for PDF documents.
*   **Real-time Analysis**: Utilizes Gemini 2.5 Flash for sub-30s processing.
*   **Structured Outputs**: JSON-enforced schema for consistent risk scoring.
*   **History Tracking**: Firestore integration to save and retrieve past deals.
