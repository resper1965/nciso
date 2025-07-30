# 🤖 **LLM Rules - Framework Crosswalk Suggestions**

## 📋 **Visão Geral**

Este documento define as regras e prompts para o sistema de IA que gera sugestões de correlações entre frameworks de segurança da informação.

---

## 🎯 **Objetivo**

Automatizar a identificação de correlações entre controles de diferentes frameworks de segurança, reduzindo o tempo manual de mapeamento e melhorando a precisão das correlações.

---

## 🧠 **Regras de Análise Semântica**

### **1. Tipos de Relação**

#### **Equivalent (Equivalente)**
- **Critérios:** Similaridade > 90%
- **Características:**
  - Mesmo objetivo de controle
  - Mesma abordagem técnica
  - Mesmo nível de rigor
  - Mesma categoria de domínio

#### **Partial Overlap (Sobreposição Parcial)**
- **Critérios:** Similaridade 70-90%
- **Características:**
  - Objetivos relacionados
  - Abordagens similares
  - Diferentes níveis de detalhe
  - Domínios relacionados

#### **Related (Relacionado)**
- **Critérios:** Similaridade 50-70%
- **Características:**
  - Objetivos complementares
  - Abordagens diferentes
  - Diferentes domínios
  - Suporte mútuo

### **2. Análise de Domínios**

#### **ISO 27001 Domains**
- **A.5 - Organizational Controls**
- **A.6 - People Controls**
- **A.7 - Physical Controls**
- **A.8 - Technological Controls**

#### **NIST CSF Domains**
- **Identify**
- **Protect**
- **Detect**
- **Respond**
- **Recover**

#### **COBIT Domains**
- **APO - Align, Plan and Organize**
- **BAI - Build, Acquire and Implement**
- **DSS - Deliver, Service and Support**
- **MEA - Monitor, Evaluate and Assess**

---

## 📝 **Prompts de IA**

### **1. Prompt Principal**

```
Você é um especialista em frameworks de segurança da informação. Analise a correlação entre dois controles de frameworks diferentes.

CONTROLE ORIGEM:
ID: {source_control_id}
Nome: {source_control_name}
Descrição: {source_control_description}
Framework: {source_framework}
Domínio: {source_domain}

CONTROLE DESTINO:
ID: {target_control_id}
Nome: {target_control_name}
Descrição: {target_control_description}
Framework: {target_framework}
Domínio: {target_domain}

INSTRUÇÕES:
1. Analise a similaridade semântica entre os controles
2. Identifique o tipo de relação (equivalent, partial_overlap, related)
3. Calcule um score de confiança (0.0 a 1.0)
4. Forneça justificativa detalhada
5. Sugira notas para o mapeamento

RESPONDA NO FORMATO JSON:
{
  "relation_type": "equivalent|partial_overlap|related",
  "confidence_score": 0.85,
  "reasoning": "Análise detalhada da correlação...",
  "suggested_notes": "Notas para o mapeamento...",
  "key_similarities": ["aspecto1", "aspecto2"],
  "key_differences": ["diferença1", "diferença2"]
}
```

### **2. Prompt de Validação**

```
Valide a seguinte correlação proposta entre frameworks de segurança:

CORRELAÇÃO:
- Tipo: {relation_type}
- Confiança: {confidence_score}
- Justificativa: {reasoning}

CRITÉRIOS DE VALIDAÇÃO:
1. A correlação é semanticamente correta?
2. O tipo de relação está adequado?
3. O score de confiança é apropriado?
4. A justificativa é clara e precisa?

RESPONDA:
- "VALID" se a correlação está correta
- "REVIEW" se precisa de revisão manual
- "REJECT" se a correlação está incorreta

Justificativa: {explicação}
```

### **3. Prompt de Análise de Domínio**

```
Analise a correlação entre domínios de frameworks de segurança:

DOMÍNIO ORIGEM: {source_domain}
DOMÍNIO DESTINO: {target_domain}

Mapeie as categorias e subcategorias entre os domínios, identificando:
1. Correlações diretas
2. Correlações parciais
3. Gaps de cobertura
4. Oportunidades de melhoria

RESPONDA NO FORMATO JSON:
{
  "domain_mapping": {
    "source_category": "target_category",
    "coverage_percentage": 75.5,
    "gaps": ["gap1", "gap2"],
    "recommendations": ["rec1", "rec2"]
  }
}
```

---

## 🔧 **Algoritmos de Similaridade**

### **1. Similaridade Semântica**

```python
def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """
    Calcula similaridade semântica entre dois textos
    """
    # 1. Normalização
    text1_clean = normalize_text(text1)
    text2_clean = normalize_text(text2)
    
    # 2. Tokenização
    tokens1 = tokenize(text1_clean)
    tokens2 = tokenize(text2_clean)
    
    # 3. Cálculo de similaridade
    intersection = set(tokens1) & set(tokens2)
    union = set(tokens1) | set(tokens2)
    
    jaccard_similarity = len(intersection) / len(union)
    
    # 4. Ponderação por palavras-chave
    keyword_weight = calculate_keyword_weight(tokens1, tokens2)
    
    # 5. Score final
    final_score = (jaccard_similarity * 0.7) + (keyword_weight * 0.3)
    
    return min(final_score, 1.0)
```

### **2. Análise de Palavras-Chave**

```python
SECURITY_KEYWORDS = {
    'access_control': ['access', 'control', 'authentication', 'authorization'],
    'data_protection': ['data', 'protection', 'encryption', 'privacy'],
    'incident_response': ['incident', 'response', 'breach', 'recovery'],
    'risk_management': ['risk', 'assessment', 'mitigation', 'management'],
    'compliance': ['compliance', 'regulation', 'policy', 'standard']
}

def calculate_keyword_weight(tokens1: list, tokens2: list) -> float:
    """
    Calcula peso baseado em palavras-chave de segurança
    """
    keyword_matches = 0
    total_keywords = 0
    
    for category, keywords in SECURITY_KEYWORDS.items():
        matches1 = sum(1 for token in tokens1 if token in keywords)
        matches2 = sum(1 for token in tokens2 if token in keywords)
        
        if matches1 > 0 and matches2 > 0:
            keyword_matches += min(matches1, matches2)
        
        total_keywords += max(matches1, matches2)
    
    return keyword_matches / total_keywords if total_keywords > 0 else 0.0
```

---

## 📊 **Métricas de Qualidade**

### **1. Precisão das Sugestões**

- **Alta Precisão (>90%):** Sugestões equivalentes
- **Média Precisão (70-90%):** Sugestões de sobreposição parcial
- **Baixa Precisão (<70%):** Sugestões relacionadas

### **2. Cobertura de Frameworks**

- **ISO 27001:** 114 controles
- **NIST CSF:** 108 controles
- **COBIT:** 40 processos
- **PCI DSS:** 78 requisitos
- **SOX:** 20 seções

### **3. Taxa de Aceitação**

- **Meta:** >80% das sugestões aceitas
- **Revisão Manual:** 15-20% das sugestões
- **Rejeição:** <5% das sugestões

---

## 🚀 **Otimizações**

### **1. Cache de Sugestões**

```python
CACHE_DURATION = 24 * 60 * 60  # 24 horas

def cache_suggestion(source_id: str, target_id: str, suggestion: dict):
    """
    Cache sugestões para evitar reprocessamento
    """
    cache_key = f"{source_id}:{target_id}"
    cache.set(cache_key, suggestion, CACHE_DURATION)
```

### **2. Processamento em Lote**

```python
def batch_generate_suggestions(source_controls: list, target_framework: str):
    """
    Gera sugestões em lote para melhor performance
    """
    suggestions = []
    
    for source_control in source_controls:
        batch_suggestions = generate_suggestions_for_control(
            source_control, 
            target_framework
        )
        suggestions.extend(batch_suggestions)
    
    return suggestions
```

### **3. Aprendizado Contínuo**

```python
def update_model_from_feedback(suggestion_id: str, accepted: bool, feedback: str):
    """
    Atualiza o modelo baseado no feedback do usuário
    """
    if accepted:
        # Reforça padrões similares
        reinforce_similar_patterns(suggestion_id)
    else:
        # Ajusta para evitar padrões similares
        adjust_for_rejection(suggestion_id, feedback)
```

---

## 🔐 **Considerações de Segurança**

### **1. Validação de Entrada**

- Sanitização de texto
- Validação de IDs de controle
- Verificação de permissões

### **2. Auditoria**

- Log de todas as sugestões geradas
- Rastreamento de aceitação/rejeição
- Métricas de performance

### **3. Privacidade**

- Não armazenar dados sensíveis
- Anonimização de feedback
- Conformidade com LGPD/GDPR

---

## 📈 **Monitoramento**

### **1. Métricas de Performance**

- Tempo de resposta das sugestões
- Taxa de aceitação
- Precisão das correlações
- Cobertura de frameworks

### **2. Alertas**

- Baixa taxa de aceitação (<70%)
- Alto tempo de resposta (>5s)
- Erros de processamento
- Falhas de conectividade

### **3. Relatórios**

- Relatório diário de sugestões
- Relatório semanal de qualidade
- Relatório mensal de cobertura

---

## ✅ **Conclusão**

Este sistema de IA para sugestões de crosswalk entre frameworks de segurança da informação:

### **🎯 Benefícios**
- ✅ **Automação** de mapeamentos manuais
- ✅ **Precisão** baseada em análise semântica
- ✅ **Escalabilidade** para múltiplos frameworks
- ✅ **Aprendizado contínuo** baseado em feedback

### **🚀 Próximos Passos**
1. **Implementar** algoritmos de similaridade avançados
2. **Integrar** com LLMs externos (OpenAI, Claude)
3. **Desenvolver** interface de feedback
4. **Criar** dashboards de monitoramento

**Status:** ✅ **LLM RULES DEFINIDAS**
**Próximo:** Implementar integração com IA externa 