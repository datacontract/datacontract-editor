import { useParams } from 'react-router-dom';
import { ServerEditor } from '../components/features/index.js';

const Server = () => {
  const { serverId } = useParams();
  const serverIndex = parseInt(serverId, 10);
  return <ServerEditor serverIndex={serverIndex} />;
};

export default Server;
