## Defeating Nondeterminism in LLM Inference

- https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/

idea: The batch size cause the nondeterministic or random result.

## GSM-Symbolic: Understanding the Limitations of Mathematical Reasoning in Large Language Models

https://arxiv.org/abs/2410.05229

idea: current LLMs cannot perform genuine logical reasoning; they replicate reasoning steps from their training data. Adding a single clause that seems relevant to the question causes significant performance drops (up to 65%) across all state-of-the-art models, even though the clause doesn't contribute to the reasoning chain needed for the final answer

## Is Chain-of-Thought Reasoning of LLMs a Mirage? A Data Distribution Lens

https://arxiv.org/html/2508.01191v3

idea: CoT reasoning is a brittle mirage that vanishes when it is pushed beyond training distributions
