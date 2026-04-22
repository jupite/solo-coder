const PokemonModels = {
    pikachu: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.8, y: 0.6, z: 0.7 } },
            head: { type: 'sphere', scale: 0.45, position: { x: 0, y: 0.45, z: 0 } },
            ears: [
                { type: 'cone', scale: { radius: 0.12, height: 0.4 }, position: { x: -0.2, y: 0.7, z: 0 }, rotation: { z: -0.4 }, useSecondaryColor: true },
                { type: 'cone', scale: { radius: 0.12, height: 0.4 }, position: { x: 0.2, y: 0.7, z: 0 }, rotation: { z: 0.4 }, useSecondaryColor: true }
            ],
            tail: { type: 'lightning', scale: 1.0, position: { x: -0.5, y: 0, z: 0 }, rotation: { y: 0.3, z: -0.2 } },
            legs: [
                { type: 'cylinder', scale: { radius: 0.08, height: 0.2 }, position: { x: -0.2, y: -1.3, z: 0.15 } },
                { type: 'cylinder', scale: { radius: 0.08, height: 0.2 }, position: { x: 0.2, y: -1.3, z: 0.15 } },
                { type: 'cylinder', scale: { radius: 0.08, height: 0.2 }, position: { x: -0.2, y: -1.3, z: -0.15 } },
                { type: 'cylinder', scale: { radius: 0.08, height: 0.2 }, position: { x: 0.2, y: -1.3, z: -0.15 } }
            ],
            eyes: [
                { type: 'sphere', scale: 0.1, position: { x: -0.15, y: 0.5, z: 0.35 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.1, position: { x: 0.15, y: 0.5, z: 0.35 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.05, position: { x: -0.12, y: 0.5, z: 0.42 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.05, position: { x: 0.18, y: 0.5, z: 0.42 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            cheeks: [
                { type: 'sphere', scale: 0.07, position: { x: -0.3, y: 0.4, z: 0.3 }, color: [1.0, 0.3, 0.3, 1.0] },
                { type: 'sphere', scale: 0.07, position: { x: 0.3, y: 0.4, z: 0.3 }, color: [1.0, 0.3, 0.3, 1.0] }
            ]
        }
    },
    charmander: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.7, y: 0.5, z: 0.6 } },
            head: { type: 'sphere', scale: 0.4, position: { x: 0, y: 0.4, z: 0 } },
            tail: { type: 'flame', scale: 0.8, position: { x: 0.5, y: 0.2, z: 0 }, rotation: { y: -0.3, x: 0.2 }, color: [1.0, 0.6, 0.0, 1.0] },
            tailBase: { type: 'cone', scale: { radius: 0.06, height: 0.3 }, position: { x: 0.5, y: 0.1, z: 0 }, rotation: { y: -0.3 } },
            legs: [
                { type: 'cylinder', scale: { radius: 0.07, height: 0.25 }, position: { x: -0.15, y: -1.3, z: 0.1 } },
                { type: 'cylinder', scale: { radius: 0.07, height: 0.25 }, position: { x: 0.15, y: -1.3, z: 0.1 } }
            ],
            arms: [
                { type: 'cylinder', scale: { radius: 0.05, height: 0.2 }, position: { x: -0.4, y: 0.1, z: 0 }, rotation: { z: 0.5 } },
                { type: 'cylinder', scale: { radius: 0.05, height: 0.2 }, position: { x: 0.4, y: 0.1, z: 0 }, rotation: { z: -0.5 } }
            ],
            wings: [
                { type: 'wing', scale: 0.6, position: { x: -0.3, y: 0.1, z: -0.1 }, rotation: { y: 0.3, z: 0.2 } },
                { type: 'wing', scale: 0.6, position: { x: 0.3, y: 0.1, z: -0.1 }, rotation: { y: -0.3, z: -0.2 } }
            ],
            eyes: [
                { type: 'sphere', scale: 0.09, position: { x: -0.12, y: 0.45, z: 0.32 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.09, position: { x: 0.12, y: 0.45, z: 0.32 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.05, position: { x: -0.1, y: 0.45, z: 0.38 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.05, position: { x: 0.14, y: 0.45, z: 0.38 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            horns: [
                { type: 'cone', scale: { radius: 0.05, height: 0.2 }, position: { x: -0.15, y: 0.6, z: 0.2 }, rotation: { x: 0.3, z: -0.2 } },
                { type: 'cone', scale: { radius: 0.05, height: 0.2 }, position: { x: 0.15, y: 0.6, z: 0.2 }, rotation: { x: 0.3, z: 0.2 } }
            ],
            belly: { type: 'ellipsoid', scale: { x: 0.4, y: 0.3, z: 0.35 }, position: { x: 0, y: 0, z: 0.1 }, useSecondaryColor: true }
        }
    },
    squirtle: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.6, y: 0.55, z: 0.6 } },
            head: { type: 'sphere', scale: 0.4, position: { x: 0, y: 0.5, z: 0 } },
            shell: { type: 'shell', scale: 1.2, position: { x: 0, y: 0.1, z: -0.1 }, useSecondaryColor: true },
            tail: { type: 'cone', scale: { radius: 0.06, height: 0.2 }, position: { x: 0, y: -0.1, z: -0.5 }, rotation: { x: 0.3 } },
            legs: [
                { type: 'cylinder', scale: { radius: 0.08, height: 0.2 }, position: { x: -0.2, y: -1.3, z: 0.1 } },
                { type: 'cylinder', scale: { radius: 0.08, height: 0.2 }, position: { x: 0.2, y: -1.3, z: 0.1 } }
            ],
            arms: [
                { type: 'cylinder', scale: { radius: 0.06, height: 0.22 }, position: { x: -0.35, y: 0.1, z: 0 }, rotation: { z: 0.3 } },
                { type: 'cylinder', scale: { radius: 0.06, height: 0.22 }, position: { x: 0.35, y: 0.1, z: 0 }, rotation: { z: -0.3 } }
            ],
            eyes: [
                { type: 'sphere', scale: 0.08, position: { x: -0.12, y: 0.55, z: 0.3 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.08, position: { x: 0.12, y: 0.55, z: 0.3 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.045, position: { x: -0.1, y: 0.55, z: 0.36 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.045, position: { x: 0.14, y: 0.55, z: 0.36 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            ears: [
                { type: 'cone', scale: { radius: 0.06, height: 0.25 }, position: { x: -0.25, y: 0.65, z: 0.1 }, rotation: { z: -0.3 } },
                { type: 'cone', scale: { radius: 0.06, height: 0.25 }, position: { x: 0.25, y: 0.65, z: 0.1 }, rotation: { z: 0.3 } }
            ],
            snout: { type: 'sphere', scale: 0.12, position: { x: 0, y: 0.45, z: 0.4 }, useSecondaryColor: true }
        }
    },
    bulbasaur: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.7, y: 0.5, z: 0.6 } },
            head: { type: 'sphere', scale: 0.35, position: { x: 0, y: 0.4, z: 0 } },
            bulb: { type: 'plantBulb', scale: 1.2, position: { x: 0, y: 0.2, z: -0.2 } },
            legs: [
                { type: 'cylinder', scale: { radius: 0.07, height: 0.22 }, position: { x: -0.2, y: -1.3, z: 0.15 } },
                { type: 'cylinder', scale: { radius: 0.07, height: 0.22 }, position: { x: 0.2, y: -1.3, z: 0.15 } },
                { type: 'cylinder', scale: { radius: 0.07, height: 0.22 }, position: { x: -0.2, y: -1.3, z: -0.15 } },
                { type: 'cylinder', scale: { radius: 0.07, height: 0.22 }, position: { x: 0.2, y: -1.3, z: -0.15 } }
            ],
            eyes: [
                { type: 'sphere', scale: 0.08, position: { x: -0.12, y: 0.45, z: 0.28 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.08, position: { x: 0.12, y: 0.45, z: 0.28 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.045, position: { x: -0.1, y: 0.45, z: 0.34 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.045, position: { x: 0.14, y: 0.45, z: 0.34 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            ears: [
                { type: 'cone', scale: { radius: 0.05, height: 0.2 }, position: { x: -0.2, y: 0.55, z: 0.1 }, rotation: { z: -0.2 } },
                { type: 'cone', scale: { radius: 0.05, height: 0.2 }, position: { x: 0.2, y: 0.55, z: 0.1 }, rotation: { z: 0.2 } }
            ],
            spots: [
                { type: 'sphere', scale: 0.04, position: { x: -0.15, y: 0.35, z: 0.25 }, useSecondaryColor: true },
                { type: 'sphere', scale: 0.04, position: { x: 0.15, y: 0.35, z: 0.25 }, useSecondaryColor: true },
                { type: 'sphere', scale: 0.035, position: { x: 0, y: 0.3, z: 0.28 }, useSecondaryColor: true }
            ]
        }
    },
    pidgey: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.5, y: 0.4, z: 0.45 } },
            head: { type: 'sphere', scale: 0.3, position: { x: 0, y: 0.35, z: 0 } },
            wings: [
                { type: 'wing', scale: 0.8, position: { x: -0.3, y: 0.1, z: 0 }, rotation: { y: 0.5 }, useSecondaryColor: true },
                { type: 'wing', scale: 0.8, position: { x: 0.3, y: 0.1, z: 0 }, rotation: { y: -0.5 }, useSecondaryColor: true }
            ],
            tail: [
                { type: 'cone', scale: { radius: 0.04, height: 0.25 }, position: { x: -0.1, y: 0, z: -0.4 }, rotation: { x: 0.2, y: -0.2 } },
                { type: 'cone', scale: { radius: 0.04, height: 0.28 }, position: { x: 0, y: 0, z: -0.42 }, rotation: { x: 0.2 } },
                { type: 'cone', scale: { radius: 0.04, height: 0.25 }, position: { x: 0.1, y: 0, z: -0.4 }, rotation: { x: 0.2, y: 0.2 } }
            ],
            legs: [
                { type: 'cylinder', scale: { radius: 0.03, height: 0.15 }, position: { x: -0.1, y: -1.3, z: 0 }, useSecondaryColor: true },
                { type: 'cylinder', scale: { radius: 0.03, height: 0.15 }, position: { x: 0.1, y: -1.3, z: 0 }, useSecondaryColor: true }
            ],
            eyes: [
                { type: 'sphere', scale: 0.07, position: { x: -0.1, y: 0.38, z: 0.25 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.07, position: { x: 0.1, y: 0.38, z: 0.25 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.04, position: { x: -0.09, y: 0.38, z: 0.3 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.04, position: { x: 0.11, y: 0.38, z: 0.3 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            beak: { type: 'cone', scale: { radius: 0.05, height: 0.12 }, position: { x: 0, y: 0.32, z: 0.35 }, rotation: { x: 1.0 }, color: [0.9, 0.7, 0.2, 1.0] }
        }
    },
    raichu: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.9, y: 0.7, z: 0.75 } },
            head: { type: 'sphere', scale: 0.5, position: { x: 0, y: 0.55, z: 0 } },
            ears: [
                { type: 'cone', scale: { radius: 0.14, height: 0.45 }, position: { x: -0.25, y: 0.8, z: 0 }, rotation: { z: -0.35 }, useSecondaryColor: true },
                { type: 'cone', scale: { radius: 0.14, height: 0.45 }, position: { x: 0.25, y: 0.8, z: 0 }, rotation: { z: 0.35 }, useSecondaryColor: true }
            ],
            earTips: [
                { type: 'cone', scale: { radius: 0.08, height: 0.2 }, position: { x: -0.25, y: 1.05, z: 0 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'cone', scale: { radius: 0.08, height: 0.2 }, position: { x: 0.25, y: 1.05, z: 0 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            tail: { type: 'lightning', scale: 1.3, position: { x: -0.6, y: 0.1, z: 0 }, rotation: { y: 0.2, z: -0.15 } },
            legs: [
                { type: 'cylinder', scale: { radius: 0.09, height: 0.25 }, position: { x: -0.25, y: -1.3, z: 0.15 } },
                { type: 'cylinder', scale: { radius: 0.09, height: 0.25 }, position: { x: 0.25, y: -1.3, z: 0.15 } },
                { type: 'cylinder', scale: { radius: 0.09, height: 0.25 }, position: { x: -0.25, y: -1.3, z: -0.15 } },
                { type: 'cylinder', scale: { radius: 0.09, height: 0.25 }, position: { x: 0.25, y: -1.3, z: -0.15 } }
            ],
            eyes: [
                { type: 'sphere', scale: 0.11, position: { x: -0.18, y: 0.6, z: 0.38 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.11, position: { x: 0.18, y: 0.6, z: 0.38 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.06, position: { x: -0.15, y: 0.6, z: 0.45 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.06, position: { x: 0.21, y: 0.6, z: 0.45 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            cheeks: [
                { type: 'sphere', scale: 0.09, position: { x: -0.35, y: 0.45, z: 0.35 }, color: [1.0, 0.3, 0.3, 1.0] },
                { type: 'sphere', scale: 0.09, position: { x: 0.35, y: 0.45, z: 0.35 }, color: [1.0, 0.3, 0.3, 1.0] }
            ]
        }
    },
    clefairy: {
        elements: {
            body: { type: 'sphere', scale: 0.55 },
            head: { type: 'sphere', scale: 0.45, position: { x: 0, y: 0.55, z: 0 } },
            ears: [
                { type: 'cone', scale: { radius: 0.1, height: 0.35 }, position: { x: -0.2, y: 0.75, z: 0.05 }, rotation: { z: -0.3 }, useSecondaryColor: true },
                { type: 'cone', scale: { radius: 0.1, height: 0.35 }, position: { x: 0.2, y: 0.75, z: 0.05 }, rotation: { z: 0.3 }, useSecondaryColor: true }
            ],
            wings: [
                { type: 'wing', scale: 0.6, position: { x: -0.4, y: 0.2, z: 0.1 }, rotation: { y: 0.6, z: 0.3 } },
                { type: 'wing', scale: 0.6, position: { x: 0.4, y: 0.2, z: 0.1 }, rotation: { y: -0.6, z: -0.3 } }
            ],
            tail: { type: 'sphere', scale: 0.15, position: { x: 0, y: -0.1, z: -0.5 }, useSecondaryColor: true },
            legs: [
                { type: 'cylinder', scale: { radius: 0.06, height: 0.18 }, position: { x: -0.15, y: -1.3, z: 0 } },
                { type: 'cylinder', scale: { radius: 0.06, height: 0.18 }, position: { x: 0.15, y: -1.3, z: 0 } }
            ],
            arms: [
                { type: 'cylinder', scale: { radius: 0.05, height: 0.18 }, position: { x: -0.35, y: 0.1, z: 0 }, rotation: { z: 0.4 } },
                { type: 'cylinder', scale: { radius: 0.05, height: 0.18 }, position: { x: 0.35, y: 0.1, z: 0 }, rotation: { z: -0.4 } }
            ],
            eyes: [
                { type: 'sphere', scale: 0.1, position: { x: -0.15, y: 0.6, z: 0.35 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.1, position: { x: 0.15, y: 0.6, z: 0.35 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.055, position: { x: -0.13, y: 0.6, z: 0.42 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.055, position: { x: 0.17, y: 0.6, z: 0.42 }, color: [0.0, 0.0, 0.0, 1.0] }
            ]
        }
    },
    zubat: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.4, y: 0.5, z: 0.35 } },
            wings: [
                { type: 'wing', scale: 1.0, position: { x: -0.5, y: 0, z: 0 }, rotation: { y: 0.4, z: 0.2 } },
                { type: 'wing', scale: 1.0, position: { x: 0.5, y: 0, z: 0 }, rotation: { y: -0.4, z: -0.2 } }
            ],
            ears: [
                { type: 'cone', scale: { radius: 0.1, height: 0.35 }, position: { x: -0.12, y: 0.5, z: 0.05 }, rotation: { z: -0.25 }, useSecondaryColor: true },
                { type: 'cone', scale: { radius: 0.1, height: 0.35 }, position: { x: 0.12, y: 0.5, z: 0.05 }, rotation: { z: 0.25 }, useSecondaryColor: true }
            ],
            eyes: [
                { type: 'sphere', scale: 0.08, position: { x: -0.1, y: 0.2, z: 0.25 }, color: [1.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.08, position: { x: 0.1, y: 0.2, z: 0.25 }, color: [1.0, 0.0, 0.0, 1.0] }
            ],
            fangs: [
                { type: 'cone', scale: { radius: 0.02, height: 0.08 }, position: { x: -0.05, y: -0.05, z: 0.3 }, rotation: { x: 0.5 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'cone', scale: { radius: 0.02, height: 0.08 }, position: { x: 0.05, y: -0.05, z: 0.3 }, rotation: { x: 0.5 }, color: [1.0, 1.0, 1.0, 1.0] }
            ]
        }
    },
    psyduck: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.6, y: 0.5, z: 0.5 } },
            head: { type: 'ellipsoid', scale: { x: 0.45, y: 0.5, z: 0.4 }, position: { x: 0, y: 0.5, z: 0 } },
            tail: { type: 'sphere', scale: 0.12, position: { x: 0, y: 0.1, z: -0.5 }, useSecondaryColor: true },
            legs: [
                { type: 'cylinder', scale: { radius: 0.05, height: 0.2 }, position: { x: -0.15, y: -1.3, z: 0 }, useSecondaryColor: true },
                { type: 'cylinder', scale: { radius: 0.05, height: 0.2 }, position: { x: 0.15, y: -1.3, z: 0 }, useSecondaryColor: true }
            ],
            arms: [
                { type: 'cylinder', scale: { radius: 0.05, height: 0.18 }, position: { x: -0.35, y: 0.05, z: 0 }, rotation: { z: 0.3 } },
                { type: 'cylinder', scale: { radius: 0.05, height: 0.18 }, position: { x: 0.35, y: 0.05, z: 0 }, rotation: { z: -0.3 } }
            ],
            wings: [
                { type: 'wing', scale: 0.4, position: { x: -0.3, y: 0.2, z: -0.1 }, rotation: { y: 0.4, z: 0.3 } },
                { type: 'wing', scale: 0.4, position: { x: 0.3, y: 0.2, z: -0.1 }, rotation: { y: -0.4, z: -0.3 } }
            ],
            eyes: [
                { type: 'sphere', scale: 0.09, position: { x: -0.15, y: 0.55, z: 0.3 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.09, position: { x: 0.15, y: 0.55, z: 0.3 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.05, position: { x: -0.13, y: 0.55, z: 0.36 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.05, position: { x: 0.17, y: 0.55, z: 0.36 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            beak: { type: 'cone', scale: { radius: 0.06, height: 0.15 }, position: { x: 0, y: 0.45, z: 0.4 }, rotation: { x: 0.8 }, useSecondaryColor: true },
            hair: [
                { type: 'cone', scale: { radius: 0.03, height: 0.2 }, position: { x: 0, y: 0.9, z: 0 }, rotation: { x: 0.2 } },
                { type: 'cone', scale: { radius: 0.03, height: 0.15 }, position: { x: -0.08, y: 0.85, z: 0.05 }, rotation: { x: 0.2, z: -0.3 } },
                { type: 'cone', scale: { radius: 0.03, height: 0.15 }, position: { x: 0.08, y: 0.85, z: 0.05 }, rotation: { x: 0.2, z: 0.3 } }
            ]
        }
    },
    poliwag: {
        elements: {
            body: { type: 'ellipsoid', scale: { x: 0.55, y: 0.6, z: 0.5 } },
            head: { type: 'ellipsoid', scale: { x: 0.5, y: 0.45, z: 0.4 }, position: { x: 0, y: 0.2, z: 0.2 } },
            tail: { type: 'ellipsoid', scale: { x: 0.15, y: 0.5, z: 0.15 }, position: { x: 0, y: 0, z: -0.7 }, rotation: { x: -0.3, z: 0.2 } },
            eyes: [
                { type: 'sphere', scale: 0.08, position: { x: -0.18, y: 0.35, z: 0.45 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.08, position: { x: 0.18, y: 0.35, z: 0.45 }, color: [1.0, 1.0, 1.0, 1.0] },
                { type: 'sphere', scale: 0.045, position: { x: -0.16, y: 0.35, z: 0.51 }, color: [0.0, 0.0, 0.0, 1.0] },
                { type: 'sphere', scale: 0.045, position: { x: 0.2, y: 0.35, z: 0.51 }, color: [0.0, 0.0, 0.0, 1.0] }
            ],
            belly: { type: 'ellipsoid', scale: { x: 0.4, y: 0.35, z: 0.3 }, position: { x: 0, y: 0.1, z: 0.25 }, useSecondaryColor: true },
            mouth: { type: 'ellipsoid', scale: { x: 0.1, y: 0.06, z: 0.08 }, position: { x: 0, y: 0.15, z: 0.48 }, color: [0.8, 0.2, 0.2, 1.0] }
        }
    }
};

const PokemonShapeMapping = {
    'pikachu': 'pikachu',
    'raichu': 'raichu',
    'charmander': 'charmander',
    'squirtle': 'squirtle',
    'bulbasaur': 'bulbasaur',
    'pidgey': 'pidgey',
    'clefairy': 'clefairy',
    'zubat': 'zubat',
    'psyduck': 'psyduck',
    'poliwag': 'poliwag'
};

function getPokemonModel(shapeName) {
    const modelName = PokemonShapeMapping[shapeName];
    return PokemonModels[modelName] || PokemonModels.pikachu;
}
