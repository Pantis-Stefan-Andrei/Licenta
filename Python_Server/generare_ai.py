from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# Configurează Gemini
genai.configure(api_key="AIzaSyA1ueKyQwMHwMgD-2Bc7dt7XsYytjZO3fA")


# Inițializează modelul Gemini
gemini = genai.GenerativeModel('gemini-pro')
app = Flask(__name__)
CORS(app) 

# Configurează Gemini
@app.route('/generate_gemini_email', methods=['POST'])
def generate_gemini_email():
    data = request.json
    expeditor = data.get('expeditor')
    destinatar = data.get('destinatar')
    subiect = data.get('subiect')
    lungime = data.get('lungime')
    tip = data.get('tip')
    emoji = data.get('folosesteEmoji')
    url = data.get('url')

    app.logger.info(f"Date primite: {data}")

    try:
        email_content = genereaza_email(expeditor, destinatar, subiect, tip, emoji, lungime, url)
        app.logger.info(f"Email generat cu succes: {email_content}")

        # Ensure the response includes the fields expected by the frontend
        return jsonify({
            'expeditor': expeditor,
            'destinatar': destinatar,
            'subiect': subiect,
            'body': email_content,
        })
    except Exception as e:
        app.logger.error(f"A apărut o eroare: {e}")
        return jsonify({'error': str(e)}), 500



def genereaza_email(expeditor, destinatar, subiect, tip, emoji, lungime, url):
    prompt = f"""
    Scrie un email de la {expeditor} către {destinatar}. Emailul este despre {subiect}.
    Tipul de email este {tip}. Lungimea emailului trebuie să fie {lungime}.
    {"Folosește emoji-uri în email pentru a-l face atractiv." if emoji else "Nu folosi emoji-uri în email."}
    Link adițional: {url}.
    """
    
    response = gemini.generate_content(prompt)
    return response.text 


if __name__ == '__main__':
    app.run(debug=True)