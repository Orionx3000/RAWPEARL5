export const MATH_PRESETS = {
  "808 & Sub Bass": [
    {
      "name": "808 Kick Core",
      "eq": [
        {
          "label": "Kick Body",
          "val": "(exp(-8 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft x Pitch Drop",
          "val": "(2 * pi * f * t * (1 + 7 * exp(-40 * t)))"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Sub Long",
      "eq": [
        {
          "label": "Slow Decay",
          "val": "(exp(-2 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "Sub Drop",
      "eq": [
        {
          "label": "Slow Decay",
          "val": "(exp(-2 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-10 * t))"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "Saturated Sub",
      "eq": [
        {
          "label": "tanh(",
          "val": "tanh("
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "5",
          "val": "5"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-3 * t))"
        }
      ]
    },
    {
      "name": "Dirty 808",
      "eq": [
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-20 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "5",
          "val": "5"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-2 * t))"
        }
      ]
    },
    {
      "name": "Miami Bass Sub",
      "eq": [
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "0.1",
          "val": "0.1"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-1.5 * t))"
        }
      ]
    },
    {
      "name": "Reese Bass (Phase)",
      "eq": [
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * (f*1.01) * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-1 * t))"
        }
      ]
    },
    {
      "name": "Heavy 808 Drive",
      "eq": [
        {
          "label": "softclip(",
          "val": "softclip("
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "10",
          "val": "10"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-2 * t))"
        }
      ]
    },
    {
      "name": "Square Sub",
      "eq": [
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-3 * t))"
        }
      ]
    },
    {
      "name": "808 Var 1",
      "eq": [
        {
          "label": "(exp(-11",
          "val": "(exp(-11"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 2",
      "eq": [
        {
          "label": "(exp(-12",
          "val": "(exp(-12"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 3",
      "eq": [
        {
          "label": "(exp(-13",
          "val": "(exp(-13"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 4",
      "eq": [
        {
          "label": "(exp(-14",
          "val": "(exp(-14"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 5",
      "eq": [
        {
          "label": "(exp(-15",
          "val": "(exp(-15"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 6",
      "eq": [
        {
          "label": "(exp(-16",
          "val": "(exp(-16"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 7",
      "eq": [
        {
          "label": "(exp(-17",
          "val": "(exp(-17"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 8",
      "eq": [
        {
          "label": "(exp(-18",
          "val": "(exp(-18"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 9",
      "eq": [
        {
          "label": "(exp(-19",
          "val": "(exp(-19"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 10",
      "eq": [
        {
          "label": "(exp(-20",
          "val": "(exp(-20"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "808 Var 11",
      "eq": [
        {
          "label": "(exp(-21",
          "val": "(exp(-21"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    }
  ],
  "909 & Classic Drums": [
    {
      "name": "909 Kick",
      "eq": [
        {
          "label": "Fast Decay",
          "val": "(exp(-10 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-40 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "20",
          "val": "20"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-80 * t))"
        }
      ]
    },
    {
      "name": "909 Snare",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-12 * t))"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * (f*3) * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-25 * t))"
        }
      ]
    },
    {
      "name": "909 HiHat Closed",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-30 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * 8000 * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "909 HiHat Open",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-5 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * 8000 * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "909 Clap",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-10 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "euclid(",
          "val": "euclid("
        },
        {
          "label": "t (Time)",
          "val": "t"
        },
        {
          "label": ",",
          "val": ","
        },
        {
          "label": "3",
          "val": "3"
        },
        {
          "label": ",",
          "val": ","
        },
        {
          "label": "16",
          "val": "16"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "909 Crash",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-1 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * 400 * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * 800 * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "909 Var 1",
      "eq": [
        {
          "label": "(exp(-6",
          "val": "(exp(-6"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-31",
          "val": "(exp(-31"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 2",
      "eq": [
        {
          "label": "(exp(-7",
          "val": "(exp(-7"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-32",
          "val": "(exp(-32"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 3",
      "eq": [
        {
          "label": "(exp(-8",
          "val": "(exp(-8"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-33",
          "val": "(exp(-33"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 4",
      "eq": [
        {
          "label": "(exp(-9",
          "val": "(exp(-9"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-34",
          "val": "(exp(-34"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 5",
      "eq": [
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-35",
          "val": "(exp(-35"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 6",
      "eq": [
        {
          "label": "(exp(-11",
          "val": "(exp(-11"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-36",
          "val": "(exp(-36"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 7",
      "eq": [
        {
          "label": "(exp(-12",
          "val": "(exp(-12"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-37",
          "val": "(exp(-37"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 8",
      "eq": [
        {
          "label": "(exp(-13",
          "val": "(exp(-13"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-38",
          "val": "(exp(-38"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 9",
      "eq": [
        {
          "label": "(exp(-14",
          "val": "(exp(-14"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-39",
          "val": "(exp(-39"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 10",
      "eq": [
        {
          "label": "(exp(-15",
          "val": "(exp(-15"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-40",
          "val": "(exp(-40"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 11",
      "eq": [
        {
          "label": "(exp(-16",
          "val": "(exp(-16"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-41",
          "val": "(exp(-41"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 12",
      "eq": [
        {
          "label": "(exp(-17",
          "val": "(exp(-17"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-42",
          "val": "(exp(-42"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 13",
      "eq": [
        {
          "label": "(exp(-18",
          "val": "(exp(-18"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-43",
          "val": "(exp(-43"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "909 Var 14",
      "eq": [
        {
          "label": "(exp(-19",
          "val": "(exp(-19"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-44",
          "val": "(exp(-44"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    }
  ],
  "TB-303 Acid": [
    {
      "name": "303 Saw Bass Core",
      "eq": [
        {
          "label": "Slow Decay",
          "val": "(exp(-4 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Square Bass",
      "eq": [
        {
          "label": "Slow Decay",
          "val": "(exp(-4 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "Acid Filter Pluck",
      "eq": [
        {
          "label": "Fast Decay",
          "val": "(exp(-8 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * 2 * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "Overdriven 303",
      "eq": [
        {
          "label": "tanh(",
          "val": "tanh("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "10",
          "val": "10"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-3 * t))"
        }
      ]
    },
    {
      "name": "303 Acid Var 1",
      "eq": [
        {
          "label": "(exp(-2.5",
          "val": "(exp(-2.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 2",
      "eq": [
        {
          "label": "(exp(-3",
          "val": "(exp(-3"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "3",
          "val": "3"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 3",
      "eq": [
        {
          "label": "(exp(-3.5",
          "val": "(exp(-3.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "4",
          "val": "4"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 4",
      "eq": [
        {
          "label": "(exp(-4",
          "val": "(exp(-4"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "5",
          "val": "5"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 5",
      "eq": [
        {
          "label": "(exp(-4.5",
          "val": "(exp(-4.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "6",
          "val": "6"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 6",
      "eq": [
        {
          "label": "(exp(-5",
          "val": "(exp(-5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "7",
          "val": "7"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 7",
      "eq": [
        {
          "label": "(exp(-5.5",
          "val": "(exp(-5.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "8",
          "val": "8"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 8",
      "eq": [
        {
          "label": "(exp(-6",
          "val": "(exp(-6"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "9",
          "val": "9"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 9",
      "eq": [
        {
          "label": "(exp(-6.5",
          "val": "(exp(-6.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "10",
          "val": "10"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 10",
      "eq": [
        {
          "label": "(exp(-7",
          "val": "(exp(-7"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "11",
          "val": "11"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 11",
      "eq": [
        {
          "label": "(exp(-7.5",
          "val": "(exp(-7.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "12",
          "val": "12"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 12",
      "eq": [
        {
          "label": "(exp(-8",
          "val": "(exp(-8"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "13",
          "val": "13"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 13",
      "eq": [
        {
          "label": "(exp(-8.5",
          "val": "(exp(-8.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "14",
          "val": "14"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 14",
      "eq": [
        {
          "label": "(exp(-9",
          "val": "(exp(-9"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "15",
          "val": "15"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 15",
      "eq": [
        {
          "label": "(exp(-9.5",
          "val": "(exp(-9.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "16",
          "val": "16"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "303 Acid Var 16",
      "eq": [
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "fold(",
          "val": "fold("
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "17",
          "val": "17"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    }
  ],
  "FM Synthesis": [
    {
      "name": "2-Op FM Bell",
      "eq": [
        {
          "label": "Slow Decay",
          "val": "(exp(-2 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * (f*3.5) * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "3-Op FM Brass",
      "eq": [
        {
          "label": "Slow Decay",
          "val": "(exp(-3 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * (f*2) * t)"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * (f*4) * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "Glassy FM Pad",
      "eq": [
        {
          "label": "Slow Decay",
          "val": "(exp(-0.5 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "0.5",
          "val": "0.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * (f*5.01) * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Woodblock",
      "eq": [
        {
          "label": "Fast Decay",
          "val": "(exp(-20 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "3",
          "val": "3"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * (f*2.4) * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 1",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "0.5",
          "val": "0.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*1.5)",
          "val": "(f*1.5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 2",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "1",
          "val": "1"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*2)",
          "val": "(f*2)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 3",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "1.5",
          "val": "1.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*2.5)",
          "val": "(f*2.5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 4",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*3)",
          "val": "(f*3)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 5",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "2.5",
          "val": "2.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*3.5)",
          "val": "(f*3.5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 6",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "3",
          "val": "3"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*4)",
          "val": "(f*4)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 7",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "3.5",
          "val": "3.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*4.5)",
          "val": "(f*4.5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 8",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "4",
          "val": "4"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*5)",
          "val": "(f*5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 9",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "4.5",
          "val": "4.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*5.5)",
          "val": "(f*5.5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 10",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "5",
          "val": "5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*6)",
          "val": "(f*6)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 11",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "5.5",
          "val": "5.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*6.5)",
          "val": "(f*6.5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 12",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "6",
          "val": "6"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*7)",
          "val": "(f*7)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 13",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "6.5",
          "val": "6.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*7.5)",
          "val": "(f*7.5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 14",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "7",
          "val": "7"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*8)",
          "val": "(f*8)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 15",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "7.5",
          "val": "7.5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*8.5)",
          "val": "(f*8.5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "FM Modulator 16",
      "eq": [
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "8",
          "val": "8"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*9)",
          "val": "(f*9)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    }
  ],
  "Physical Modeling": [
    {
      "name": "Plucked String",
      "eq": [
        {
          "label": "Fast Decay",
          "val": "(exp(-10 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-2 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "Marimba Bar",
      "eq": [
        {
          "label": "Fast Decay",
          "val": "(exp(-5 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-15 * t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * (f*3.9) * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "Bouncing Rubber Ball",
      "eq": [
        {
          "label": "bounce(",
          "val": "bounce("
        },
        {
          "label": "t (Time)",
          "val": "t"
        },
        {
          "label": ",",
          "val": ","
        },
        {
          "label": "15",
          "val": "15"
        },
        {
          "label": ",",
          "val": ","
        },
        {
          "label": "3",
          "val": "3"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "String Pluck 1",
      "eq": [
        {
          "label": "(exp(-6",
          "val": "(exp(-6"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "(exp(-3",
          "val": "(exp(-3"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "String Pluck 2",
      "eq": [
        {
          "label": "(exp(-7",
          "val": "(exp(-7"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "(exp(-4",
          "val": "(exp(-4"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "String Pluck 3",
      "eq": [
        {
          "label": "(exp(-8",
          "val": "(exp(-8"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "(exp(-5",
          "val": "(exp(-5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "String Pluck 4",
      "eq": [
        {
          "label": "(exp(-9",
          "val": "(exp(-9"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "(exp(-6",
          "val": "(exp(-6"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "String Pluck 5",
      "eq": [
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "(exp(-7",
          "val": "(exp(-7"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "String Pluck 6",
      "eq": [
        {
          "label": "(exp(-11",
          "val": "(exp(-11"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "(exp(-8",
          "val": "(exp(-8"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "String Pluck 7",
      "eq": [
        {
          "label": "(exp(-12",
          "val": "(exp(-12"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "saw(",
          "val": "saw("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "(exp(-9",
          "val": "(exp(-9"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    }
  ],
  "Chaotic & Attractors": [
    {
      "name": "Logistic Glitch Burst",
      "eq": [
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "t (Time)",
          "val": "t"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "10",
          "val": "10"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Fast Decay",
          "val": "(exp(-10 * t))"
        }
      ]
    },
    {
      "name": "Rule 30 Noise Mod",
      "eq": [
        {
          "label": "rule30(",
          "val": "rule30("
        },
        {
          "label": "t (Time)",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-3 * t))"
        }
      ]
    },
    {
      "name": "Bifurcation Bass",
      "eq": [
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "0.5",
          "val": "0.5"
        },
        {
          "label": "+",
          "val": "+"
        },
        {
          "label": "0.5",
          "val": "0.5"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "Slow Decay",
          "val": "(exp(-4 * t))"
        }
      ]
    },
    {
      "name": "Chaotic Bounce",
      "eq": [
        {
          "label": "bounce(",
          "val": "bounce("
        },
        {
          "label": "t (Time)",
          "val": "t"
        },
        {
          "label": ",",
          "val": ","
        },
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "t (Time)",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "20",
          "val": "20"
        },
        {
          "label": ",",
          "val": ","
        },
        {
          "label": "1",
          "val": "1"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2πft (Phase)",
          "val": "(2 * pi * f * t)"
        },
        {
          "label": ")",
          "val": ")"
        }
      ]
    },
    {
      "name": "Attractor Burst 1",
      "eq": [
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "6",
          "val": "6"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Attractor Burst 2",
      "eq": [
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "7",
          "val": "7"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Attractor Burst 3",
      "eq": [
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "8",
          "val": "8"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Attractor Burst 4",
      "eq": [
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "9",
          "val": "9"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Attractor Burst 5",
      "eq": [
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "10",
          "val": "10"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Attractor Burst 6",
      "eq": [
        {
          "label": "logistic(",
          "val": "logistic("
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "11",
          "val": "11"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sin(",
          "val": "sin("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-10",
          "val": "(exp(-10"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    }
  ],
  "Chiptune & 8-bit": [
    {
      "name": "Square Arp 1",
      "eq": [
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Square Arp 2",
      "eq": [
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Square Arp 3",
      "eq": [
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Square Arp 4",
      "eq": [
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Square Arp 5",
      "eq": [
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "f",
          "val": "f"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-2",
          "val": "(exp(-2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    }
  ],
  "Experimental & Glitch": [
    {
      "name": "Data Corrupt 1",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*1)",
          "val": "(f*1)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-5",
          "val": "(exp(-5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Data Corrupt 2",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*2)",
          "val": "(f*2)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-5",
          "val": "(exp(-5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Data Corrupt 3",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*3)",
          "val": "(f*3)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-5",
          "val": "(exp(-5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Data Corrupt 4",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*4)",
          "val": "(f*4)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-5",
          "val": "(exp(-5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    },
    {
      "name": "Data Corrupt 5",
      "eq": [
        {
          "label": "noise()",
          "val": "noise()"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "sqr(",
          "val": "sqr("
        },
        {
          "label": "2",
          "val": "2"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "pi",
          "val": "pi"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(f*5)",
          "val": "(f*5)"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t",
          "val": "t"
        },
        {
          "label": ")",
          "val": ")"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "(exp(-5",
          "val": "(exp(-5"
        },
        {
          "label": "*",
          "val": "*"
        },
        {
          "label": "t))",
          "val": "t))"
        }
      ]
    }
  ]
};