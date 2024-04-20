package org.openremote.agent.protocol.twitch;

import com.github.philippheuer.credentialmanager.domain.OAuth2Credential;
import com.github.philippheuer.events4j.api.domain.IDisposable;
import com.github.philippheuer.events4j.reactor.ReactorEventHandler;
import com.github.twitch4j.TwitchClient;
import com.github.twitch4j.TwitchClientBuilder;
import com.github.twitch4j.chat.events.AbstractChannelMessageEvent;
import com.github.twitch4j.eventsub.events.*;
import com.github.twitch4j.eventsub.events.ChannelSubscribeEvent;
import com.github.twitch4j.helix.domain.CreateClipList;
import com.github.twitch4j.helix.domain.UserList;
import com.github.twitch4j.pubsub.events.*;
import com.github.twitch4j.pubsub.events.HypeTrainEndEvent;
import org.openremote.agent.protocol.AbstractProtocol;
import org.openremote.model.Container;
import org.openremote.model.asset.agent.ConnectionStatus;
import org.openremote.model.attribute.Attribute;
import org.openremote.model.attribute.AttributeEvent;
import org.openremote.model.attribute.AttributeRef;
import org.openremote.model.syslog.SyslogCategory;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;

import static org.openremote.model.syslog.SyslogCategory.PROTOCOL;

public class TwitchProtocol extends AbstractProtocol<TwitchAgent, TwitchAgentLink> {

    protected static final AtomicReference<TwitchClient> client = new AtomicReference<>();
    protected final Map<AttributeRef, Runnable> requestMap = new HashMap<>();
    protected final Map<AttributeRef, IDisposable> eventsMap = new HashMap<>();

    protected static final Logger LOG = SyslogCategory.getLogger(PROTOCOL, TwitchProtocol.class);
    public static final String PROTOCOL_DISPLAY_NAME = "Twitch";

    public TwitchProtocol(TwitchAgent agent) {
        super(agent);
    }

    @Override
    protected void doStart(Container container) throws Exception {
        if (agent.getClientId().isEmpty() || agent.getClientSecret().isEmpty()) {
            setConnectionStatus(ConnectionStatus.ERROR);
            return;
        }

        initClient(agent.getClientId(), agent.getClientSecret(), agent.getAccessToken());

        setConnectionStatus(ConnectionStatus.CONNECTED);
    }

    @Override
    protected void doStop(Container container) throws Exception {
        requestMap.clear();
        eventsMap.forEach((k, v) -> v.dispose());
        eventsMap.clear();
    }

    @Override
    protected void doLinkAttribute(String assetId, Attribute<?> attribute, TwitchAgentLink agentLink) throws RuntimeException {
        if (agentLink.getCommand().isPresent()) {
            AttributeRef ref = new AttributeRef(assetId, attribute.getName());
            switch (agentLink.getCommand().get()) {

                // Getting user from the User ID given
                case GET_USER_INFO -> {
                    if (agent.getUserId().isEmpty()) {
                        LOG.severe("Tried to retrieve user info from Twitch, but user id is empty");
                        return;
                    }
                    requestMap.put(ref, () -> {
                        UserList users = client.get().getHelix().getUsers(null, Arrays.asList(agent.getUserId().get()), null).execute();
                        writeAttributeValue(agentLink, ref, users.getUsers().get(0));
                    });
                }

                // Creating a clip
                case POST_CREATE_CLIP -> {
                    if (agent.getUserId().isEmpty()) {
                        LOG.severe("Tried to create clip to Twitch, but user id is empty");
                        return;
                    }
                    requestMap.put(ref, () -> {
                        CreateClipList clipList = client.get().getHelix().createClip(null, agent.getUserId().get(), false).execute();
                        writeAttributeValue(agentLink, ref, clipList.getData());
                    });
                }

                case SUB_CHAT_MESSAGES -> {
                    if (agent.getUsername().isEmpty()) {
                        LOG.severe("Tried to subscribe to Twitch chat messages, but username is empty");
                        return;
                    }
                    if (!client.get().getChat().isChannelJoined(agent.getUsername().get())) {
                        LOG.info("doLinkAttribute: Joining chat channel " + agent.getUsername().get() + "...");
                        client.get().getChat().joinChannel(agent.getUsername().get());
                    }
                    LOG.info("doLinkAttribute: Subscribing to chat messages...");
                    IDisposable sub = client.get().getEventManager().onEvent(AbstractChannelMessageEvent.class, event -> {
                        TwitchChatMessageEvent messageEvent = new TwitchChatMessageEvent()
                                .setBadges(event.getMessageEvent().getBadges())
                                .setChannel(event.getChannel())
                                .setMessage(event.getMessage());

                        writeAttributeValue(agentLink, ref, messageEvent);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_USER_FOLLOW -> {
                    IDisposable sub = client.get().getEventManager().onEvent(ChannelFollowEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_USER_SUBSCRIBE -> {
                    IDisposable sub = client.get().getEventManager().onEvent(ChannelSubscribeEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_USER_CHEER -> {
                    IDisposable sub = client.get().getEventManager().onEvent(ChannelCheerEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_USER_BAN -> {
                    IDisposable sub = client.get().getEventManager().onEvent(ChannelBanEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_USER_RAID -> {
                    IDisposable sub = client.get().getEventManager().onEvent(ChannelRaidEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_CHANNELPOINTS_CREATED -> {
                    IDisposable sub = client.get().getEventManager().onEvent(ChannelPointsCustomRewardEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_CHANNELPOINTS_REDEEMED -> {
                    IDisposable sub = client.get().getEventManager().onEvent(ChannelPointsRedemptionEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_HYPETRAIN_APPROACHING -> {
                    IDisposable sub = client.get().getEventManager().onEvent(HypeTrainApproachingEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_HYPETRAIN_START -> {
                    IDisposable sub = client.get().getEventManager().onEvent(HypeTrainStartEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_HYPETRAIN_LEVELUP -> {
                    IDisposable sub = client.get().getEventManager().onEvent(HypeTrainLevelUpEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }

                case SUB_HYPETRAIN_END -> {
                    IDisposable sub = client.get().getEventManager().onEvent(HypeTrainEndEvent.class, event -> {
                        writeAttributeValue(agentLink, ref, event);
                    });
                    eventsMap.put(ref, sub);
                }
            }
        }
    }

    protected void writeAttributeValue(TwitchAgentLink agentLink, AttributeRef originRef, Object value) {
        if (agentLink == null || originRef == null) {
            return;
        }
        // If either writing to a different attribute,..
        if (agentLink.getPollingAttribute().isPresent()) {
            AttributeRef newRef = new AttributeRef(originRef.getId(), agentLink.getPollingAttribute().get());
            LOG.info("Writing value to polling attribute " + newRef.getName() + "...");
            AttributeEvent attributeEvent = new AttributeEvent(newRef, value, timerService.getCurrentTimeMillis());
            assetService.sendAttributeEvent(attributeEvent);
            /*updateLinkedAttribute(new AttributeRef(originRef.getId(), agentLink.getPollingAttribute().get()), value);*/

        }
        // ... or writing to the linked attribute
        else {
            LOG.info("Writing value to linked attribute " + originRef.getName() + "...");
            updateLinkedAttribute(originRef, value);
        }
    }

    @Override
    protected void doUnlinkAttribute(String assetId, Attribute<?> attribute, TwitchAgentLink agentLink) {

    }

    @Override
    protected void doLinkedAttributeWrite(TwitchAgentLink agentLink, AttributeEvent event, Object processedValue) {
        if (requestMap.containsKey(event.getRef())) {

            LOG.info("Processing doLinkedAttributeWrite for " + event.getRef().getName() + " in asset " + event.getAssetName());
            requestMap.get(event.getRef()).run();

            // If writing to a different attribute, process the incoming value for the linked attribute.
            if (agentLink.getPollingAttribute().isPresent()) {
                updateLinkedAttribute(event.getRef(), processedValue);
            }
        }
    }

    @Override
    public String getProtocolName() {
        return PROTOCOL_DISPLAY_NAME;
    }

    @Override
    public String getProtocolInstanceUri() {
        return "";
    }

    protected static void initClient(Optional<String> clientId, Optional<String> clientSecret, Optional<String> accessToken) {
        if (clientId.isPresent() && clientSecret.isPresent() && accessToken.isPresent()) {
            synchronized (client) {
                if (client.get() == null) {
                    client.set(createClient(clientId.get(), clientSecret.get(), accessToken.get()));
                }
            }
        }
    }

    protected static TwitchClient createClient(String clientId, String clientSecret, String accessToken) {
        return TwitchClientBuilder.builder()
                .withClientId(clientId)
                .withClientSecret(clientSecret)
                .withEnableHelix(true)
                .withEnableChat(true)
                .withDefaultAuthToken(new OAuth2Credential("twitch", accessToken))
                .withEnableEventSocket(true)
                .withDefaultEventHandler(ReactorEventHandler.class)
                .build();
    }
}
