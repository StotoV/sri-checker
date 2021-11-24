FROM node:17-slim

# Chrome dependencies
RUN apt-get update && apt-get -f install -y \
    fonts-liberation \
    gconf-service \

    #libappindicator1 \

    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libfontconfig1 \
    libgbm-dev \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libicu-dev \
    libjpeg-dev \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpng-dev \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils

# Install npm packages
WORKDIR /app
COPY ./package*.json ./
RUN npm install

# Make browser executable for puppeteer
RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium

# Copy source code
COPY . ./

# Install executable
RUN npm install -g .

# USER node

# CMD ["npm", "test"]
# CMD ["npm", "start", "--", "https://googlechrome.github.io/samples/subresource-integrity/", "-o", "./output/out.json"]
ENTRYPOINT ["tail", "-f", "/dev/null"]
