FROM denoland/deno:1.38.3

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

RUN apt-get update -y && apt-get install -y ca-certificates fuse3 sqlite3

COPY --from=flyio/litefs:0.5 /usr/local/bin/litefs /usr/local/bin/litefs

WORKDIR /app

COPY . .
RUN deno cache main.ts
RUN deno task build

EXPOSE 8000

ENTRYPOINT litefs mount
