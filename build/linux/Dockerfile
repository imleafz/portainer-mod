FROM portainer/base AS production

COPY dist/docker /
COPY dist/mustache-templates /mustache-templates/
COPY dist/portainer /
COPY dist/public /public/

COPY build/docker-extension /

VOLUME /data
WORKDIR /

EXPOSE 9000
EXPOSE 9443
EXPOSE 8000

ENTRYPOINT ["/portainer"]
