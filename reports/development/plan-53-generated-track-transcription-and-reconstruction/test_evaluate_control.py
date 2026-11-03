import unittest
from evaluate_control import maximum_match

class Matching(unittest.TestCase):
    def test_matches_one_to_one_and_uses_augmenting_path(self):
        e=[{'pitch':60,'drum':False,'time':0.0},{'pitch':60,'drum':False,'time':.09}]
        p=[{'pitch':60,'drum':False,'time':.05},{'pitch':60,'drum':False,'time':-.08}]
        self.assertEqual(maximum_match(e,p),2)
        self.assertEqual(maximum_match(e,p[:1]),1)

    def test_pitch_drum_and_tolerance_are_required(self):
        e=[{'pitch':60,'drum':False,'time':0.0}]
        for p in ({'pitch':61,'drum':False,'time':0.0},{'pitch':60,'drum':True,'time':0.0},{'pitch':60,'drum':False,'time':.11}):
            self.assertEqual(maximum_match(e,[p]),0)
