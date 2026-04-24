FROM adguard/node-ssh:22.11--0 AS base
WORKDIR /workdir
ENV YARN_CACHE_FOLDER=/yarn-cache

FROM base AS deps
RUN --mount=type=cache,target=/yarn-cache,id=disable-amp-yarn \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    yarn install --frozen-lockfile

FROM base AS source-deps
COPY --from=deps /workdir/node_modules ./node_modules
COPY . .

# =============================================================================
# Test plan
# =============================================================================

FROM source-deps AS test
RUN yarn lint && yarn dev

FROM scratch AS test-output
COPY --from=test /workdir/build/dev/disable-amp.meta.js /artifacts/disable-amp.meta.js
COPY --from=test /workdir/build/dev/disable-amp.user.js /artifacts/disable-amp.user.js

# =============================================================================
# Build beta plan
# =============================================================================

FROM source-deps AS build-beta
RUN yarn beta

FROM scratch AS build-beta-output
COPY --from=build-beta /workdir/build/beta/variables.txt /artifacts/variables.txt
COPY --from=build-beta /workdir/build/beta/disable-amp.meta.js /artifacts/disable-amp.meta.js
COPY --from=build-beta /workdir/build/beta/disable-amp.user.js /artifacts/disable-amp.user.js

# =============================================================================
# Build release plan
# =============================================================================

FROM source-deps AS build-release
RUN yarn release

FROM scratch AS build-release-output
COPY --from=build-release /workdir/build/release/variables.txt /artifacts/variables.txt
COPY --from=build-release /workdir/build/release/disable-amp.meta.js /artifacts/disable-amp.meta.js
COPY --from=build-release /workdir/build/release/disable-amp.user.js /artifacts/disable-amp.user.js
