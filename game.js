
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

        // --- Configuration ---
        const PLAYER_SPEED = 200.0;
        const AFTERBURNER_MULTIPLIER = 3.0;
        const ROLL_SPEED = Math.PI * 1.0;
        const PITCH_SPEED = Math.PI * 0.8;
        const YAW_SPEED = Math.PI * 0.5;
        const DAMPING = 0.95;
        const CAMERA_BASE_FOV = 75;
        const CAMERA_MAX_FOV_BOOST = 25;
        const GROUND_SIZE = 8000;
        const GROUND_SEGMENTS = 100;
        const STAR_COUNT = 5000;
        const DAY_NIGHT_CYCLE_MINUTES = 10;
        const ASSETS_DIR = 'assets/';
        const MODEL_URL = `${ASSETS_DIR}/shenyang_j-11.glb`;
        const MODEL_SCALE = 0.8;
        const CLOUD_TEXTURE_URL = `${ASSETS_DIR}/cloud10.png`;
        const ROAD_TEXTURE_URL = `${ASSETS_DIR}/road.jpg`;
        const PROJECTILE_SPEED = 500.0;
        const FIRE_RATE_LIMIT = 200; // ms between shots

        // --- Global Variables ---
        let scene, camera, renderer, clock, skyLight, sunLight, ufo;
        let playerAircraft = null;
        let playerVelocity, playerAngularVelocity;
        let controls = { forward: 0, backward: 0, left: 0, right: 0, up: 0, down: 0, boost: 0 };
        let buildingBoundingBoxes = [];
        let isColliding = false;
        let sunAngle = Math.PI / 4;
        let loadedModelTemplate = null;
        let loadingManager = null;
        let loadingIndicator = null;
        let clouds = null;
        let roadTexture = null;
        let projectiles = [];
        let lastShotTime = 0;

        // --- Game State ---
        let score = 0;
        let highScore = localStorage.getItem('flightGameHighScore') || 0;
        let gameActive = false;
        let timer = 120;

        // --- Initialization ---
        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(CAMERA_BASE_FOV, window.innerWidth / window.innerHeight, 0.1, 20000);
            renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('flight-game-canvas') });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(renderer.domElement);
            clock = new THREE.Clock();

            loadingIndicator = document.getElementById('loading-indicator');

            skyLight = new THREE.HemisphereLight(0x87ceeb, 0x000000, 0.6);
            scene.add(skyLight);

            sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
            sunLight.position.set(0, 1000, 1000);
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 2048;
            sunLight.shadow.mapSize.height = 2048;
            scene.add(sunLight);

            scene.fog = new THREE.Fog(0xcccccc, 1000, 15000);

            createGround();
            createStars();
            loadResources();

            window.addEventListener('resize', onWindowResize, false);
            document.addEventListener('mousedown', onMouseDown, false);
        }

        function loadResources() {
            showLoadingIndicator(true);
            loadingManager = new THREE.LoadingManager(() => {
                initializeGame();
            }, undefined, (url) => {
                displayError(`Failed to load: ${url}`);
            });

            const gltfLoader = new GLTFLoader(loadingManager);
            gltfLoader.load(MODEL_URL, (gltf) => {
                loadedModelTemplate = gltf.scene;
                loadedModelTemplate.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
                loadedModelTemplate.traverse((child) => { if (child.isMesh) child.castShadow = true; });
                loadedModelTemplate.rotation.set(0, Math.PI, 0);
            });

            const textureLoader = new THREE.TextureLoader(loadingManager);
            textureLoader.load(ROAD_TEXTURE_URL, (texture) => {
                roadTexture = texture;
                roadTexture.wrapS = THREE.RepeatWrapping;
                roadTexture.wrapT = THREE.RepeatWrapping;
            });

            textureLoader.load(CLOUD_TEXTURE_URL, (texture) => {
                createClouds(texture);
            });
        }

        function initializeGame() {
            showLoadingIndicator(false);
            createPlayerAircraft();
            createUFO();
            setupControls();
            startGame();
            animate();
        }

        function startGame() {
            score = 0;
            timer = 120;
            gameActive = true;
            document.getElementById('high-score').textContent = highScore;
        }

        function createGround() {
            // Simplified for brevity
            const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
            const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x556B2F });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);
        }

        function createStars() {
            const starGeometry = new THREE.BufferGeometry();
            const starVertices = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                const x = (Math.random() - 0.5) * 15000;
                const y = Math.random() * 5000 + 500;
                const z = (Math.random() - 0.5) * 15000;
                starVertices.push(x, y, z);
            }
            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
            const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff }));
            scene.add(stars);
        }

        function createClouds(texture) {
            const cloudGeometry = new THREE.BufferGeometry();
            const positions = [];
            for (let i = 0; i < 200; i++) {
                positions.push((Math.random() - 0.5) * GROUND_SIZE, Math.random() * 500 + 600, (Math.random() - 0.5) * GROUND_SIZE);
            }
            cloudGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            clouds = new THREE.Points(cloudGeometry, new THREE.PointsMaterial({ size: 1000, map: texture, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
            scene.add(clouds);
        }

        function createPlayerAircraft() {
            playerAircraft = loadedModelTemplate.clone();
            playerAircraft.position.set(0, 50, 0);
            scene.add(playerAircraft);
            playerVelocity = new THREE.Vector3();
            playerAngularVelocity = new THREE.Vector3();
        }

        function createUFO() {
            const ufoGeometry = new THREE.SphereGeometry(20, 32, 16);
            const ufoMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.6 });
            ufo = new THREE.Mesh(ufoGeometry, ufoMaterial);
            ufo.position.set(0, 200, -500);
            scene.add(ufo);
        }

        function onMouseDown(event) {
            if (event.button === 0 && gameActive) {
                fireProjectile();
            }
        }

        function fireProjectile() {
            const now = Date.now();
            if (now - lastShotTime < FIRE_RATE_LIMIT) return;
            lastShotTime = now;

            const projectileGeometry = new THREE.SphereGeometry(2, 8, 8);
            const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(playerAircraft.quaternion);
            projectile.position.copy(playerAircraft.position).add(forward.multiplyScalar(10));
            projectile.velocity = forward.multiplyScalar(PROJECTILE_SPEED).add(playerVelocity);

            projectiles.push(projectile);
            scene.add(projectile);
        }

        function setupControls() {
            document.addEventListener('keydown', (e) => {
                switch(e.code) {
                    case 'KeyW': controls.up = 1; break;
                    case 'KeyS': controls.down = 1; break;
                    case 'KeyA': controls.left = 1; break;
                    case 'KeyD': controls.right = 1; break;
                    case 'KeyQ': controls.rollLeft = 1; break;
                    case 'KeyE': controls.rollRight = 1; break;
                    case 'ShiftLeft': controls.boost = 1; break;
                }
            });
            document.addEventListener('keyup', (e) => {
                switch(e.code) {
                    case 'KeyW': controls.up = 0; break;
                    case 'KeyS': controls.down = 0; break;
                    case 'KeyA': controls.left = 0; break;
                    case 'KeyD': controls.right = 0; break;
                    case 'KeyQ': controls.rollLeft = 0; break;
                    case 'KeyE': controls.rollRight = 0; break;
                    case 'ShiftLeft': controls.boost = 0; break;
                }
            });
        }

        function animate() {
            requestAnimationFrame(animate);
            const deltaTime = clock.getDelta();

            if (gameActive) {
                timer -= deltaTime;
                if (timer <= 0) {
                    gameActive = false;
                    timer = 0;
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('flightGameHighScore', highScore);
                        document.getElementById('high-score').textContent = highScore;
                    }
                }
            }

            updatePlayerMovement(deltaTime);
            updateProjectiles(deltaTime);
            updateUFO(deltaTime);
            updateDayNightCycle(deltaTime);
            updateCamera();
            updateUI();

            renderer.render(scene, camera);
        }

        function updatePlayerMovement(deltaTime) {
            if (!playerAircraft) return;

            const maxSpeed = PLAYER_SPEED * (controls.boost ? AFTERBURNER_MULTIPLIER : 1.0);
            const thrust = PLAYER_SPEED * 2.0; // Simplified thrust

            let targetPitch = (controls.up - controls.down) * PITCH_SPEED;
            let targetYaw = (controls.left - controls.right) * YAW_SPEED;
            let targetRoll = (controls.rollLeft - controls.rollRight) * ROLL_SPEED;

            playerAngularVelocity.x = THREE.MathUtils.lerp(playerAngularVelocity.x, targetPitch, deltaTime * 5.0);
            playerAngularVelocity.y = THREE.MathUtils.lerp(playerAngularVelocity.y, targetYaw, deltaTime * 5.0);
            playerAngularVelocity.z = THREE.MathUtils.lerp(playerAngularVelocity.z, targetRoll, deltaTime * 5.0);

            const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), playerAngularVelocity.x * deltaTime);
            const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), playerAngularVelocity.y * deltaTime);
            const qz = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), playerAngularVelocity.z * deltaTime);
            playerAircraft.quaternion.multiply(qx).multiply(qy).multiply(qz).normalize();

            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(playerAircraft.quaternion);
            playerVelocity.add(forward.multiplyScalar(thrust * deltaTime));
            playerVelocity.clampLength(0, maxSpeed);
            playerAircraft.position.add(playerVelocity.clone().multiplyScalar(deltaTime));

            if (playerAircraft.position.y < 1) playerAircraft.position.y = 1;
        }

        function updateProjectiles(deltaTime) {
            for (let i = projectiles.length - 1; i >= 0; i--) {
                const projectile = projectiles[i];
                projectile.position.add(projectile.velocity.clone().multiplyScalar(deltaTime));

                const distanceToUFO = projectile.position.distanceTo(ufo.position);
                if (distanceToUFO < 20) { // UFO collision radius
                    scene.remove(projectile);
                    projectiles.splice(i, 1);
                    if (gameActive) {
                        score += 10;
                    }
                    // Add explosion effect later
                }

                if (projectile.position.length() > 10000) { // Remove if too far
                    scene.remove(projectile);
                    projectiles.splice(i, 1);
                }
            }
        }

        function updateUFO(deltaTime) {
            ufo.position.x = Math.sin(clock.getElapsedTime() * 0.2) * 400;
            ufo.position.z = Math.cos(clock.getElapsedTime() * 0.2) * 400 - 600;
        }

        function updateDayNightCycle(deltaTime) {
            sunAngle = (sunAngle + 0.05 * deltaTime) % (2 * Math.PI);
            sunLight.position.set(Math.cos(sunAngle) * 1500, Math.sin(sunAngle) * 1000, 1000);
            // Simplified lighting update
        }

        function updateCamera() {
            const relativeCameraOffset = new THREE.Vector3(0, 5, 15);
            const cameraOffset = relativeCameraOffset.applyQuaternion(playerAircraft.quaternion);
            camera.position.lerp(playerAircraft.position.clone().add(cameraOffset), 0.1);
            camera.lookAt(playerAircraft.position);
            const fov = CAMERA_BASE_FOV + (playerVelocity.length() / PLAYER_SPEED) * CAMERA_MAX_FOV_BOOST;
            camera.fov = THREE.MathUtils.lerp(camera.fov, fov, 0.1);
            camera.updateProjectionMatrix();
        }

        function updateUI() {
            document.getElementById('speed').textContent = (playerVelocity.length() * 3.6).toFixed(0);
            document.getElementById('altitude').textContent = playerAircraft.position.y.toFixed(1);
            document.getElementById('timer').textContent = Math.ceil(timer);
            document.getElementById('score').textContent = score;
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function displayError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
        }

        init();
        