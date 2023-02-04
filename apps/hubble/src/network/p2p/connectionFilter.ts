import { ConnectionGater, MultiaddrConnection } from '@libp2p/interface-connection';
import { PeerId } from '@libp2p/interface-peer-id';
import { Multiaddr } from '@multiformats/multiaddr';
import { logger } from '~/utils/logger';

/**
 * ConnectionFilter ensures that nodes only collect to peers in a specific allowlist.
 *
 * It implements the entire libp2p ConnectionGater interface to intercept calls at the lowest level
 * and prevent the connection.
 *
 * Note: arrow functions are used since libp2p's createLibp2p uses a "recursivePartial" on the
 * passed in object and class methods are not enumerated. Using arrow functions allows their
 * recursivePartial enumerator to parse the object (see `./gossipNode.ts`)
 */
export class ConnectionFilter implements ConnectionGater {
  private allowedPeers: string[] | undefined;

  constructor(addrs: string[] | undefined) {
    this.allowedPeers = addrs;
  }

  denyDialPeer = async (peerId: PeerId): Promise<boolean> => {
    const deny = this.shouldDeny(peerId.toString());
    if (deny) {
      logger.info(`ConnectionFilter denyDialPeer: denied a connection with ${peerId}`);
    }
    return deny;
  };

  denyDialMultiaddr = async (peerId: PeerId, _multiaddr: Multiaddr): Promise<boolean> => {
    const deny = this.shouldDeny(peerId.toString());
    if (deny) {
      logger.info(`ConnectionFilter denyDialMultiaddr: denied a connection with ${peerId}`);
    }
    return deny;
  };

  denyInboundConnection = async (_maConn: MultiaddrConnection): Promise<boolean> => {
    /** PeerId may not be known yet, let it pass and other filters will catch it. */
    return false;
  };

  denyOutboundConnection = async (peerId: PeerId, _maConn: MultiaddrConnection): Promise<boolean> => {
    const deny = this.shouldDeny(peerId.toString());
    if (deny) {
      logger.info(`ConnectionFilter denyOutboundConnection: denied a connection with ${peerId}`);
    }
    return deny;
  };

  denyInboundEncryptedConnection = async (peerId: PeerId, _maConn: MultiaddrConnection): Promise<boolean> => {
    const deny = this.shouldDeny(peerId.toString());
    if (deny) {
      logger.info(`ConnectionFilter denyInboundEncryptedConnection: denied a connection with ${peerId}`);
    }
    return deny;
  };

  denyOutboundEncryptedConnection = async (peerId: PeerId, _maConn: MultiaddrConnection): Promise<boolean> => {
    const deny = this.shouldDeny(peerId.toString());
    if (deny) {
      logger.info(`ConnectionFilter denyOutboundEncryptedConnection: denied a connection with ${peerId}`);
    }
    return deny;
  };

  denyInboundUpgradedConnection = async (peerId: PeerId, _maConn: MultiaddrConnection): Promise<boolean> => {
    const deny = this.shouldDeny(peerId.toString());
    if (deny) {
      logger.info(`ConnectionFilter denyInboundUpgradedConnection: denied a connection with ${peerId}`);
    }
    return deny;
  };

  denyOutboundUpgradedConnection = async (peerId: PeerId, _maConn: MultiaddrConnection): Promise<boolean> => {
    const deny = this.shouldDeny(peerId.toString());
    if (deny) {
      logger.info(`ConnectionFilter denyOutboundUpgradedConnection: denied a connection with ${peerId}`);
    }
    return deny;
  };

  filterMultiaddrForPeer = async (peer: PeerId): Promise<boolean> => {
    return !this.shouldDeny(peer.toString());
  };

  /* -------------------------------------------------------------------------- */
  /*                               Private Methods                              */
  /* -------------------------------------------------------------------------- */

  private shouldDeny(peerId: string) {
    if (!peerId) return true;
    if (this.allowedPeers === undefined) return false;

    const found = this.allowedPeers.find((value) => {
      return peerId && value === peerId;
    });
    return found === undefined;
  }
}