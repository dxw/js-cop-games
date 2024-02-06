export type SocketServerEvent<Event, T = void> = T extends Record<
  string,
  unknown
>
  ? [Event, T]
  : Event;
