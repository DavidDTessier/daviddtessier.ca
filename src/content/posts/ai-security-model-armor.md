---
categories: ["ai", "security"]
date: 3/22/2025
image: ./images/ai-security-model-armor/protecting-llm-model-armor.png
title: "Shielding the Sentient: Understanding and Configuring GCP's Model Armor for LLM and Agentic AI Protection"
description: A comprehensive look at Google Cloud's Model Armor and how to secure and protect AI workloads
---

## Rise of Agentic AI

The emergence of Agentic AI, which are Large Language Model (LLM)-based systems capable of autonomous decision-making and action with minimal human intervention, signifies an immense paradigm shift across diverse sectors, including customer service, supply chain management, and financial services.

Although these systems, characterized by their autonomy and dynamic interaction capabilities, hold immense potential, they also present critical security and privacy challenges and make them vulnerable to:

* **Prompt Injection**: Malicious actors can manipulate the agent's behavior by inserting crafted prompts into its input stream.
* **Data Poisoning**: Corrupting the training data to introduce biases or vulnerabilities into the model.
* **Model Extraction**: Stealing the model's parameters or architecture to create a copy or to understand its weaknesses.
* **Unintended Consequences**: The agent's actions might have unforeseen and potentially harmful effects due to its complex decision-making process.
* **Ethical Concerns**: The agent's behavior might violate ethical principles or societal norms.

How do we protect the AI agent?... Well just as physical armor protects a soldier, a concept called "Model Armor" aims to safeguard these intelligent agents from malicious attacks and unintended consequences.

This post explores the concept of Model Armor, specifically Google Cloud's recently added [Model Armor](https://cloud.google.com/security-command-center/docs/model-armor-overview) Service, and outlines what it is and how to configure it to protect your AI workloads including Agentic AI agents.

## What is "Model Armor"?

Model Armor is a conceptual framework encompassing a suite of techniques and strategies designed to enhance the robustness, security, and resilience of AI models, particularly those deployed in agentic contexts. It's not a single tool but rather a layered approach, addressing vulnerabilities at various stages of an agent's lifecycle.

Key aspects include:

* **Input Validation and Sanitization**: Filtering and cleaning input data to prevent injection attacks and adversarial prompts.
* **Output Monitoring and Control**: Scrutinizing the agent's actions and outputs for anomalies or potentially harmful behaviors.
* **Model Hardening**: Strengthening the underlying AI model against adversarial attacks, such as prompt injection, data poisoning, and model extraction.
* **Runtime Monitoring and Anomaly Detection**: Continuously observing the agent's behavior and detecting deviations from expected patterns.
* **Explainability and Interpretability**: Providing insights into the agent's decision-making process to identify and mitigate potential biases or errors.
* **Policy Enforcement and Guardrails**: Defining clear boundaries and rules for the agent's actions, ensuring adherence to ethical and safety standards.
Feedback loops and reinforcement learning: Allowing the agent to learn from its mistakes and improve its safety over time.

Model Armor mitigates the risks listed previously by providing a multi-layered defense, ensuring that the agent operates safely and reliably.

There are several solutions out on the market that leverage this type of framework, such as the following:

* [Prompt Security](https://www.prompt.security/)
* [Meta's Prompt Guard](https://www.llama.com/docs/model-cards-and-prompt-formats/prompt-guard/)
* [Kong's AI Prompt Guard](https://docs.konghq.com/hub/kong-inc/ai-prompt-guard/)
* Open Source options like:
  * [GPTSafe Prompt Guard](https://github.com/GPTSafe/PromptGuard)
  * [PromptMap](https://github.com/utkusen/promptmap)
  * [LLM Guard](https://protectai.com/llm-guard)

However, recently Google Cloud introduces their own managed solution called _Model Armor_, the remainder of this post will be focused on this new solution.

## Google Cloud - Model Armor Service

[Model Armor](https://cloud.google.com/security-command-center/docs/model-armor-overview) which is a fully managed service provided by Google Cloud Platform. It offers capabilities to enhance the safety and security of AI applications. By leveraging the concepts described previously in this post, Model Armor screens LLM prompts and responses for various types of security and safety risks.

GCP's Model Armor offers the following core features:

* **Universal Model and Cloud Compatibility** :
  * Operates independently of specific AI models or cloud platforms, enabling seamless integration across multi-cloud and multi-model environments.
* **Centralized Policy Management** :
  * Provides a unified platform for managing and enforcing security and safety policies across all deployed AI models.
* **API-Driven Integration** :
  * Offers a public REST API for direct integration of prompt and response screening into applications, supporting diverse deployment architectures.
* **Granular Access Control**:
  * Implements Role-Based Access Control (RBAC) to precisely manage user permissions and access levels.
* **Low-Latency Regional Endpoints** :
  * Delivers API access through regional endpoints to minimize latency and optimize performance.
* **Global Availability** :
  * Deployed across multiple regions in the United States and Europe for broad accessibility.
* **Security Command Center Integration** :
  * Seamlessly integrates with Security Command Center, allowing for centralized visibility, violation detection, and remediation.
* **Enhanced Safety and Security** :
  * **_Comprehensive Content Safety Filters_** :
    * Includes filters for detecting and mitigating harmful content, such as sexually explicit material, dangerous content, harassment, and hate speech.
  * **_Advanced Threat Detection_** :
    * Detects and prevents prompt injection and jailbreak attacks, safeguarding AI models from manipulation.
* **Detects Malicious URLs within prompts and responses**.
  * **_Integrated Data Loss Prevention (DLP)_** :
    * Leverages Google Cloud's Sensitive Data Protection to discover, classify, and protect sensitive data (e.g., PII, intellectual property), preventing unauthorized disclosure.
* **PDF Content Screening** :
  * Supports the screening of text within PDF documents, for malicious content.

Currently, Model Armor is supported as a Global endpoint `modelarmor.googleapis.com` are as regional endpoints in the following supported regions:

* United States
  * Iowa (us-central1 region): `modelarmor.us-central1.rep.googleapis.com`
* Northern Virginia (us-east4 region): `modelarmor.us-east4.rep.googleapis.com`
  * Oregon (us-west1 region): `modelarmor.us-west1.rep.googleapis.com`
* Europe
  * Netherlands (europe-west4 region): `modelarmor.europe-west4.rep.googleapis.com`

Model Armor can be purchased as standalone services or integrated as part of Security Command Center, pricing for Model Armor can be found [here](https://cloud.google.com/security-command-center/pricing#possible-indirect-charges-associated-with-model-armor).

### Configuring GCP's Model Armor

The following image (taken from Google's [Model Armor documentation](https://cloud.google.com/security-command-center/docs/model-armor-overview)) describes the standard reference architecture for Model Armor which shows an application using Model Armor to protect an LLM and a user.

![Model Armor Ref Arch](https://cloud.google.com/static/security-command-center/images/model-armor-architecture.svg)

#### IAM Requirements

Access to Model Armor can be controlled using robust IAM Roles, as shown below:

* `modelarmor.admin` & `modelarmor.floorSettingsAdmin`: Used for Administrators and owners
* `modelarmor.user`: Used for users and applications planning to screen prompts and and responses
* `modelarmor.viewer`: Used for template viewers
* `modelarmor.floorSettingsViewer`: Used for Floor Settings Viewers

#### Enabling Model Armor

Model Armor can be configured either using the GCP Console or through the use of the GCP Command Line tool `gcloud`. To enable Model Armor API, use the following commands

```bash
gcloud config set api_endpoint_overrides/modelarmor "https://modelarmor.LOCATION.rep.googleapis.com/"
```

Replace the `LOCATION` in the above command to specify the region (of the supported regions) where you would like to leverage Model Armor, otherwise the default global api is used `modelarmor.googleapis.com`.

Finally, use the following command to enable API:

```bash
gcloud services enable modelarmor.googleapis.com --project=PROJECT_ID
```

#### Templates

In order to screen prompts and response through Model Armor you must first create _Model Armor Templates_, which are a set of customized filters for safety and security thresholds that allow you control over the content that is being flagged. You can configure the confidence thresholds and triggers for the following:

* _Prompt Injection & Jailbreak Attacks — Detects and blocks manipulative inputs._
* _Sensitive Data Leakage — Protects personally identifiable information (PII) and intellectual property._
* _Malicious URLs — Identifies phishing links embedded in prompts or responses._
* _Harmful Content — Filters explicit, violent, or biased outputs._
* _PDF Content Scanning — Inspects text within PDFs for security risks._

These thresholds represent _confidence levels_, which indicates how confident the service is about the prompt and/or response including any offending content if applicable.

The following example JSON show confidence levels for all supported filters:

```json
[
    { "filterType": "HATE_SPEECH", "confidenceLevel": "MEDIUM_AND_ABOVE" },
    { "filterType": "DANGEROUS", "confidenceLevel": "MEDIUM_AND_ABOVE"},
    { "filterType": "HARASSMENT", "confidenceLevel": "MEDIUM_AND_ABOVE" },
    { "filterType": "SEXUALLY_EXPLICIT", "confidenceLevel": "MEDIUM_AND_ABOVE" }
]
```

The following `gcloud` command will generate a template in Model Amor, in also include custom error codes and messages that will be returned if any of the security and safety filters return a match:

```bash
# create the model armor template
gcloud model-armor templates create demo-mdl-armor --location us-central1 \
    --project $GCP_Project_ID --malicious-uri-filter-settings-enforcement=enabled \
    --rai-settings-filters=./responsible-ai-settings.json \
    --basic-config-filter-enforcement=enabled --pi-and-jailbreak-filter-settings-enforcement=enabled \
    --pi-and-jailbreak-filter-settings-confidence-level=medium-and-above \
    --template-metadata-custom-llm-response-safety-error-code=798 \
    --template-metadata-custom-llm-response-safety-error-message="The content returned from the LLM has been reviewed for harmful or explicit content. Unfortunate we cannot display this content." \
    --template-metadata-custom-prompt-safety-error-code=799 \
    --template-metadata-custom-prompt-safety-error-message="Unfortunately I cannot process that question, please refine your request and avoid any explicit content." \
    --template-metadata-ignore-partial-invocation-failures --template-metadata-log-operations \
    --template-metadata-log-sanitize-operations
```

#### Model Armor Integration

Once the _Model Armor_ template is created and ready to use, now you have a two options to choose from when it comes to validations and/or sanitization which are described in detail below.

**User Prompt Inspection/Sanitization**
This sanitization process leverages the _Model Armor_ service to validate and sanitize the user's prompt that is being sent to the LLM. The sanitization process inspects the content of the user prompt against the configured safety and protect filters of _Model Armor_. The following python code demonstrates how to integrate model armor:

```python
# imports
from google.cloud import modelarmor_v1
...

# Create the model armor client
 ml_armor_client = modelarmor_v1.ModelArmorClient(
        transport="rest",
        client_options = {"api_endpoint" : "https://modelarmor.us-central1.rep.googleapis.com"},
        credentials=creds)

# inspect user prompt

user_prompt_data = modelarmor_v1.DataItem()
user_prompt_data.text = prompt
request = modelarmor_v1.SanitizeUserPromptRequest(
        name=gcp_model_armor_template,
        user_prompt_data=user_prompt_data
    )
response = client.sanitize_user_prompt(request)
```

If a match is found you can restrict the prompt from being sent to the LLM and display a custom message or the configured one from the _Model Armor_ template, which is returned in the response from the _Model Armor_ service.

The following error message is return from the response IF a match is discovered during the inspection of the user prompt:

```text
"Unfortunately I cannot process that question, please refine your request and avoid any explicit content."
```

**LLM Model Response Inspection/Sanitization**
Similar to the inspection of the user prompt prior to LLM submission, you can inspect and sanitize the response that is returned from the LLM, this is done as shown in the following python code:

```python

# imports
from google.cloud import modelarmor_v1
...

# Create the model armor client
 ml_armor_client = modelarmor_v1.ModelArmorClient(
        transport="rest",
        client_options = {"api_endpoint" : "https://modelarmor.us-central1.rep.googleapis.com"},
        credentials=creds)

# inspect LLM response
client = get_model_armor_client()
    llm_resp_data = modelarmor_v1.DataItem()
    llm_resp_data.text = llm_response
    request = modelarmor_v1.SanitizeModelResponseRequest(
        name=gcp_model_armor_template,
        model_response_data=llm_resp_data
    )
response = client.sanitize_model_response(request)
```

Similar to the prompt inspection results, if a match is found you can restrict the response from the LLM being displayed to the end user and display a custom message or the configured one from the _Model Armor_ template, which is returned in the response from the _Model Armor_ service.

The following error message is return from the response IF a match is discovered during the inspection of the LLM response:

```text
"The content returned from the LLM has been reviewed for harmful or explicit content. Unfortunate we cannot display this content."
```

**Sample output**
The following is a sample output from the _Model Armor_ Sanitization processes, the output format is used for both _Prompt Inspection_ and _LLM Response Inspection_.

Sample response output:

```json
filter_match_state: MATCH_FOUND
filter_results {
  key: "sdp"
  value {
    sdp_filter_result {
      inspect_result {
        execution_state: EXECUTION_SUCCESS
        match_state: NO_MATCH_FOUND
      }
    }
  }
}
filter_results {
  key: "rai"
  value {
    rai_filter_result {
      execution_state: EXECUTION_SUCCESS
      match_state: NO_MATCH_FOUND
      rai_filter_type_results {
        key: "sexually_explicit"
        value {
          match_state: NO_MATCH_FOUND
        }
      }
      rai_filter_type_results {
        key: "hate_speech"
        value {
          match_state: NO_MATCH_FOUND
        }
      }
      rai_filter_type_results {
        key: "harassment"
        value {
          match_state: NO_MATCH_FOUND
        }
      }
      rai_filter_type_results {
        key: "dangerous"
        value {
          match_state: NO_MATCH_FOUND
        }
      }
    }
  }
}
filter_results {
  key: "pi_and_jailbreak"
  value {
    pi_and_jailbreak_filter_result {
      execution_state: EXECUTION_SUCCESS
      match_state: MATCH_FOUND
      confidence_level: MEDIUM_AND_ABOVE
    }
  }
}
filter_results {
  key: "malicious_uris"
  value {
    malicious_uri_filter_result {
      execution_state: EXECUTION_SUCCESS
      match_state: NO_MATCH_FOUND
    }
  }
}
filter_results {
  key: "csam"
  value {
    csam_filter_filter_result {
      execution_state: EXECUTION_SUCCESS
      match_state: NO_MATCH_FOUND
    }
  }
}
sanitization_metadata {
  error_code: 799
  error_message: "Unfortunately I cannot process that question, please refine your request and avoid any explicit content."
}
invocation_result: SUCCESS
```

### Live Demo

The following video shows a live demonstration of a simplistic chat application build on Ollama+LangChain and leverages GCP's Model Armor for security and responsibility protection.

[![Live Demo](https://markdown-videos-api.jorgenkh.no/youtube/YjcsrfSZYmg)](https://youtu.be/YjcsrfSZYmg)

## Conclusion

As LLM's and Agentic AI become more sophisticated, the need for robust security, safety, and responsibility will only increase. Tools like GCP's _Model Armor_ is only a starting point for this level of protection, so I will leave you with some final guiding principles to increase the security and robustness of your LLM and Agentic AI workloads:

* **Input Validation and Sanitization**:
  * Always implement robust input filtering to block potentially harmful characters or code snippets, which can be covered by tools like _Mdoel Armor_
  * Use regular expressions or natural language processing techniques to detect and neutralize adversarial prompts.
  * Employ input validation libraries to enforce data type and format constraints.
* **Output Monitoring and Control**:
  * Establish a monitoring system to track the agent's actions and outputs.
  * Implement rule-based or machine learning-based anomaly detection to identify unusual behavior.
  * Use output filtering to block potentially harmful or sensitive information (covered by tools like Model Armor)
  * Implement a "kill switch" that allows a human operator to interrupt the agent if needed.
* **Model Hardening**:
  * Train the model on diverse and robust datasets to improve its resilience to adversarial attacks.
  * Implement adversarial training techniques to expose the model to potential attacks and improve its robustness.
  * Use techniques like differential privacy to protect against model extraction.
  * Utilize techniques like prompt hardening, and prompt engineering to limit the effectiveness of prompt injection attacks. (covered by tools like Model Armor)
* **Runtime Monitoring and Anomaly Detection**:
  * Continuously monitor the agent's resource usage, network activity, and behavior patterns.
  * Use machine learning models to detect anomalies and trigger alerts.
  * Implement logging and auditing mechanisms to track the agent's actions and decisions.
* **Explainability and Interpretability**:
  * Use techniques like [LIME or SHAP](https://www.markovml.com/blog/lime-vs-shap) to explain the agent's decision-making process.
  * Visualize the agent's internal states and activations to gain insights into its behavior.
  * Implement methods to trace the agent's reasoning back to its input data.
* **Policy Enforcement and Guardrails**:
  * Define clear rules and constraints for the agent's actions.
  * Use formal verification techniques to ensure that the agent adheres to these rules.
  * Implement a policy engine to enforce access control and data privacy.
  * Employ techniques like [Reinforcement Learning from Human Feedback (RLHF)](https://en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback) to align agent behavior with human values.
* **Feedback loops and reinforcement learning**:
  * Create a system that allows for human feedback to be entered into the system.
  * Utilize reinforcement learning to reinforce safe behaviors, and penalize unsafe ones.
  * Create a system that allows the agent to learn from its past actions and improve its safety over time.

Future research should focus on:

* Developing more effective adversarial training techniques.
* Creating more robust anomaly detection systems.
* Improving the explainability and interpretability of complex AI models.
* Establishing ethical guidelines and standards for Agentic AI development.

By prioritizing security and safety, we can ensure that complex LLM workloads and Agentic AI benefit society while mitigating its potential risks.

All the code presented in this post can be found on my GitHub repository for [LLM Security](https://github.com/DavidDTessier/llm-security).
