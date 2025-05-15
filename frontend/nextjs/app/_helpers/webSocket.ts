'use client'

import getToken from "../api/_auth/getToken"

export let socket: WebSocket | null = null

// One listener per message type (e.g. 'sendMessage', 'statusUpdate')
const listeners: { [key: string]: (data: any) => void } = {} = {}

// Connect WebSocket and set up event handlers
export const connectWebSocket = async (): Promise<WebSocket | null> => {
  if (socket) return socket

  try {
    const token = (await getToken()).session
    socket = new WebSocket(`ws://localhost:8080/ws?session=${token}`)

    socket.onopen = () => {
      console.log("✅ WebSocket connected")
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log(data)
        const type = data.type

        if (type && listeners[type]) {
          listeners[type](data)
        } else {
          console.error("No listener registered for message type:", type)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    socket.onclose = () => {
      console.log("WebSocket disconnected")
      socket = null
    }

    socket.onerror = (err) => {
      console.error("WebSocket error:", err)
    }

    return socket
  } catch (error) {
    alert("WebSocket connection failed: " + error)
    return null
  }
}

// Register a callback for a given message type
export const onMessageType = (type: string, callback: (data: any) => void) => {
  listeners[type] = callback
}
