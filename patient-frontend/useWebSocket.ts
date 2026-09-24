import { useEffect } from "react";
import { Client } from "@stomp/stompjs";

export function useWebSocket(
    onQueueUpdate: (data: any) => void
) {
    useEffect(() => {

        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",

            reconnectDelay: 5000,

            onConnect: () => {
                console.log("HospitalFlow WebSocket connected");

                client.subscribe(
                    "/topic/queue",
                    (message) => {

                        try {
                            const data = JSON.parse(message.body);

                            console.log(
                                "Queue update received:",
                                data
                            );

                            onQueueUpdate(data);

                        } catch (error) {

                            console.error(
                                "WebSocket message error:",
                                error
                            );
                        }
                    }
                );
            },

            onDisconnect: () => {
                console.log(
                    "HospitalFlow WebSocket disconnected"
                );
            },

            onStompError: (frame) => {
                console.error(
                    "WebSocket STOMP error:",
                    frame.headers["message"]
                );
            }
        });

        client.activate();

        return () => {
            client.deactivate();
        };

    }, [onQueueUpdate]);
}