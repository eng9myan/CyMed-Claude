class KnowledgePlatform:
    """
    Mock Vector Search / Semantic Search Layer
    """
    @staticmethod
    def vector_search(query, top_k=3):
        # Mocking pinecone/milvus/pgvector search
        return [
            {"id": "doc-001", "type": "TREATMENT_PROTOCOL", "content": "Standard protocol for Hypertension..."},
            {"id": "doc-002", "type": "CLINICAL_GUIDELINE", "content": "AHA/ACC Guideline for Blood Pressure Management..."},
            {"id": "doc-003", "type": "DRUG_INFO", "content": "Lisinopril contraindications and dosages..."}
        ]
        
    @staticmethod
    def build_context(query):
        docs = KnowledgePlatform.vector_search(query)
        context = "\n".join([doc['content'] for doc in docs])
        return context
