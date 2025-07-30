from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model and tokenizer
model = AutoModelForCausalLM.from_pretrained("tanusrich/Mental_Health_Chatbot")
tokenizer = AutoTokenizer.from_pretrained("tanusrich/Mental_Health_Chatbot")

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

@app.route('/api/respond', methods=['POST'])
def respond():
    try:
        data = request.json
        inputs = tokenizer(data['message'], return_tensors='pt').to(device)
        
        with torch.no_grad():
            output = model.generate(
                **inputs,
                max_new_tokens=200,
                temperature=0.7,
                top_k=50,
                top_p=0.9,
                repetition_penalty=1.2,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(output[0], skip_special_tokens=True)
        return jsonify({'response': response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)