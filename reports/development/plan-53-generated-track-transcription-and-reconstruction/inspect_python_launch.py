"""Synthetic launch-identity probe; no ML, network, or real audio.

Execute only in a coordinated bounded turn. Output goes to private local logs.
"""
import ctypes as c
from ctypes import wintypes as w
import json
import os
import sys


class ENTRY(c.Structure):
    _fields_ = [("dwSize", w.DWORD), ("cntUsage", w.DWORD), ("th32ProcessID", w.DWORD),
                ("th32DefaultHeapID", c.c_size_t), ("th32ModuleID", w.DWORD),
                ("cntThreads", w.DWORD), ("th32ParentProcessID", w.DWORD),
                ("pcPriClassBase", c.c_long), ("dwFlags", w.DWORD), ("szExeFile", w.WCHAR*260)]


k = c.WinDLL("kernel32", use_last_error=True)
def fn(name, result, args):
    value = getattr(k, name); value.restype=result; value.argtypes=args; return value


snapshot = fn("CreateToolhelp32Snapshot", w.HANDLE, [w.DWORD,w.DWORD])
first = fn("Process32FirstW", w.BOOL, [w.HANDLE,c.POINTER(ENTRY)])
next_item = fn("Process32NextW", w.BOOL, [w.HANDLE,c.POINTER(ENTRY)])
open_process = fn("OpenProcess", w.HANDLE, [w.DWORD,w.BOOL,w.DWORD])
query_image = fn("QueryFullProcessImageNameW", w.BOOL, [w.HANDLE,w.DWORD,w.LPWSTR,c.POINTER(w.DWORD)])
close = fn("CloseHandle", w.BOOL, [w.HANDLE])


def image(pid):
    process = open_process(0x1000, False, pid)
    if not process: raise OSError(c.get_last_error(), "OpenProcess")
    try:
        buf = c.create_unicode_buffer(32768); length = w.DWORD(len(buf))
        if not query_image(process, 0, buf, c.byref(length)): raise OSError(c.get_last_error(), "QueryFullProcessImageName")
        return buf.value
    finally: close(process)


def main():
    handle = snapshot(2,0)
    if handle == c.c_void_p(-1).value: raise OSError(c.get_last_error(), "snapshot")
    try:
        item = ENTRY(); item.dwSize = c.sizeof(item)
        if not first(handle,c.byref(item)): raise OSError(c.get_last_error(), "Process32First")
        parent = None
        while True:
            if item.th32ProcessID == os.getpid():
                parent = item.th32ParentProcessID; break
            item.dwSize = c.sizeof(item)
            if not next_item(handle,c.byref(item)): break
        if parent is None: raise ValueError("own process missing from snapshot")
        print(json.dumps({"own_pid":os.getpid(),"own_image":image(os.getpid()),"sys_executable":sys.executable,
                          "parent_pid":parent,"parent_image":image(parent)}))
    finally: close(handle)


if __name__ == "__main__":
    try: main()
    except Exception as exc:
        print("Launch identity unavailable: "+type(exc).__name__,file=sys.stderr); sys.exit(1)
