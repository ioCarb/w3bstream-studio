import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
class MyEmitter extends EventEmitter {
  emit(type: any, ...args: any[]) {
    super.emit('*', { type, args });
    return super.emit(type, ...args) || super.emit('', ...args);
  }
}

interface MessageEvents {
  // @ts-ignore
  '*': ({ type: string, args: [] }) => void;
  'app.ready': () => void;
  'user.login': () => void;
  'user.update-pwd': () => void;
  'project.list': (data: any[]) => void;
  'project.create': () => void;
  'project.delete': () => void;
  'applet.list': (data: any[]) => void;
  'applet.create': () => void;
  'applet.delete': () => void;
  'applet.publish-event': () => void;
  'instance.deploy': () => void;
  'instance.handle': () => void;
  'instance.delete': () => void;
  'publisher.create': () => void;
  'publisher.update': () => void;
  'publisher.delete': () => void;
  'spotlight.register': () => void;
  'postman.request': () => void;
  'strategy.create': () => void;
  'strategy.update': () => void;
  'strategy.delete': () => void;
  'contractlog.create': () => void;
  'contractlog.delete': () => void;
  'chainTx.create': () => void;
  'chainTx.delete': () => void;
  'chainHeight.create': () => void;
  'chainHeight.delete': () => void;

  signer: (signer: any) => void;
  provider: (signer: any) => void;
}

export const eventBus = new MyEmitter() as TypedEmitter<MessageEvents>;
