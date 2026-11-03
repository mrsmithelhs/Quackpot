"""Pure validation of normalized rule snapshots, not an OS isolation proof."""
import ntpath


def verify_rules(observed, expected):
    """Require exactly the reviewed named outbound block rules for two images.

    Caller must collect OS state and separately test DNS, child executables,
    actual enforcement and cleanup. This function never changes the firewall.
    """
    if len(expected)!=2 or len(set(expected))!=2 or len({ntpath.normcase(ntpath.normpath(p)) for p in expected.values()})!=2:
        raise ValueError("two distinct rule names and executable paths required")
    matching=[item for item in observed if item.get("name") in expected]
    if len(matching)!=2 or {x.get("name") for x in matching}!=set(expected):
        raise ValueError("reviewed rules missing or duplicated")
    for item in matching:
        name=item["name"]; path=item.get("program")
        if not isinstance(path,str) or not ntpath.isabs(path): raise ValueError("rule program path invalid")
        if ntpath.normcase(ntpath.normpath(path)) != ntpath.normcase(ntpath.normpath(expected[name])):
            raise ValueError("rule program mismatch")
        if item.get("direction")!="Outbound" or item.get("action")!="Block" or item.get("enabled") is not True:
            raise ValueError("rule direction, action or enabled state mismatch")
        if item.get("profile")!="Any" or item.get("protocol")!="Any" or item.get("remote_address")!="Any":
            raise ValueError("rule scope is narrower than reviewed")
    return {"status":"matching normalized rules; enforcement and cleanup not proven", "rule_count":2}


def verify_process_images(observed_paths, allowed_paths):
    """Check one sampled owned-job image list; cannot observe between samples."""
    if not observed_paths or len(observed_paths)>2:
        raise ValueError("unexpected owned-job process count")
    allowed={ntpath.normcase(ntpath.normpath(p)) for p in allowed_paths}
    if len(allowed)!=2 or any(not ntpath.isabs(p) for p in allowed_paths):
        raise ValueError("two distinct absolute executable paths required")
    for path in observed_paths:
        if not isinstance(path,str) or ntpath.normcase(ntpath.normpath(path)) not in allowed:
            raise ValueError("unexpected owned-job process image")
    return {"status":"sampled images match; short-lived processes not excluded", "count":len(observed_paths)}
