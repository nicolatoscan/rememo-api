FROM ubuntu
WORKDIR /root
RUN DEBIAN_FRONTEND='noninteractive' apt update && \
    DEBIAN_FRONTEND='noninteractive' apt upgrade -y && \
    DEBIAN_FRONTEND='noninteractive' apt install -y git sudo curl wget nano && \
    curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash - && \
    DEBIAN_FRONTEND='noninteractive' apt update && \
    DEBIAN_FRONTEND='noninteractive' apt install -y nodejs && \
    git clone https://github.com/nicolatoscan/rememo-api && \
    cd rememo-api && \
    npm install
WORKDIR /root/rememo-api
CMD bash
