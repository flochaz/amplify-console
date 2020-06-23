# Use the standard Amazon Linux base, provided by ECR/KaOS
# It points to the standard shared Amazon Linux image, with a versioned tag.
FROM amazonlinux:2
MAINTAINER Amazon AWS

# Framework Versions
ENV VERSION_NODE=10.16.3

# UTF-8 Environment
ENV LANGUAGE en_US:en
ENV LANG=en_US.UTF-8
ENV LC_ALL en_US.UTF-8

## Install OS packages
RUN touch ~/.bashrc
RUN yum  -y install \
        jq \
        zip \
        gcc \
        openssl-devel \
        bzip2-devel \
        libffi-devel \
        wget \
        tar \
        gzip \
        make && \
    yum clean all && \
    rm -rf /var/cache/yum



## Install Node 10
#RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
RUN /bin/bash -c ". ~/.nvm/nvm.sh && \
	nvm install $VERSION_NODE && nvm use $VERSION_NODE && \
	nvm alias default node && nvm cache clear"

ENV PATH /root/.nvm/versions/node/v${VERSION_NODE}/bin:/usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

## Install AWS Amplify CLI for VERSION_NODE
RUN /bin/bash -c ". ~/.nvm/nvm.sh && nvm use ${VERSION_NODE} && \
    npm install -g @aws-amplify/cli"

RUN /bin/bash -c ". ~/.nvm/nvm.sh && nvm use ${VERSION_NODE} && \
    npm install -g typescript && \
    npm install -g @angular/cli && \
    npm install -g @angular-devkit/build-angular" 


WORKDIR /

# Install Python 3.8
RUN wget https://www.python.org/ftp/python/3.8.2/Python-3.8.2.tgz && \
    tar -xzvf Python-3.8.2.tgz

WORKDIR /Python-3.8.2

RUN ./configure --enable-optimizations && \
    make altinstall

RUN ln -s /usr/local/bin/python3.8 /usr/local/bin/python3
RUN ln -s /usr/local/bin/pip3.8 /usr/local/bin/pip3

RUN pip3 install --user pipenv

## Environment Setup
RUN echo "nvm use ${VERSION_NODE} 1> /dev/null" >> ~/.bashrc

## Install awscli
RUN /bin/bash -c "pip3 install awscli && rm -rf /var/cache/apk/*"

RUN source ~/.bashrc

ENTRYPOINT [ "bash", "-c" ]
