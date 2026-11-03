"""Best-effort Python audit guard, not an OS or native-code sandbox."""
import sys

class UnexpectedAccess(RuntimeError):
    pass

class Guard:
    def __init__(self):
        self.events = []

    def audit(self, event, args):
        if event in ('socket.connect', 'socket.connect_ex', 'socket.sendto', 'socket.sendmsg',
                     'socket.getaddrinfo', 'socket.gethostbyname', 'socket.gethostbyaddr',
                     'subprocess.Popen', 'os.system', 'os.posix_spawn', 'os.spawn', 'os.exec',
                     'os.startfile', 'os.startfile/2'):
            # Never log addresses, command lines, credentials, or input content.
            self.events.append(event)
            raise UnexpectedAccess('Unexpected network or subprocess request: ' + event)

    def check(self):
        if self.events:
            raise UnexpectedAccess('An unexpected request was attempted: ' + ', '.join(self.events))
        return True

    def install(self):
        sys.addaudithook(self.audit)
        return self
