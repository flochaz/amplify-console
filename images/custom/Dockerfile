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
RUN yum -y install \
      gcc \
      openssl-devel \
      bzip2-devel \
      libffi-devel \
      python-configobj \
      jq \
      tar \
      zip \
      gzip \
    yum clean all && \
    rm -rf /var/cache/yum


##python
RUN curl https://pyenv.run | bash
ENV PATH="/root/.pyenv/shims:/root/.pyenv/bin:$PATH"

#Python 3.8
ENV PYTHON_38_VERSION="3.8.3"

COPY tools/runtime_configs/python/$PYTHON_38_VERSION /root/.pyenv/plugins/python-build/share/python-build/$PYTHON_38_VERSION
RUN   env PYTHON_CONFIGURE_OPTS="--enable-shared" pyenv install $PYTHON_38_VERSION; rm -rf /tmp/*
RUN   pyenv global  $PYTHON_38_VERSION
RUN set -ex \
    && pip3 install --no-cache-dir --upgrade --force-reinstall "pip==$PYTHON_PIP_VERSION" \
    && pip3 install --no-cache-dir --upgrade "PyYAML==5.3.1" \
    && pip3 install --no-cache-dir --upgrade setuptools wheel aws-sam-cli awscli boto3 pipenv virtualenv

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

## Environment Setup
RUN echo "nvm use ${VERSION_NODE} 1> /dev/null" >> ~/.bashrc

## Install awscli
RUN /bin/bash -c "pip3 install awscli && rm -rf /var/cache/apk/*"

RUN source ~/.bashrc

ENTRYPOINT [ "bash", "-c" ]
