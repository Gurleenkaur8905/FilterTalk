import { useContext,createContext , useState, useEffect} from "react";
import {Socket, io} from "socket.io-client"

interface iSocketContext{

}
// usecontext in react for global state
export const SocketContext = createContext<iSocketContext| null>(null); // SocketContext is mycontext name and its default value


// value prop for provider component
export const SocketContextProvider =({children}:{children: React.ReactNode})=>{
  
    const [socket, setSocket] = useState<Socket| null>(null)
    // initializing a socket
    useEffect(() => {
        const newSocket = io(); // Initialize the socket using `io()`
        setSocket(newSocket);
    
        // Cleanup: Disconnect the socket when the component unmounts 
        return () => {
          newSocket.disconnect();
        };
      }, []);
    
    return <SocketContext.Provider value={{}}> 
    {children}
    </SocketContext.Provider>
}

export const useSocket=()=>{
    const context = useContext(SocketContext);
    if(context === null) 
    {
        throw new Error("useSocket must be used within a SocketContextProvider");
    }
    return context;
}