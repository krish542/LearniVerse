import Phaser from 'phaser';
import clickableAreas from './clickableAreas';
import { io } from 'socket.io-client';
import socket from "../../socket";
import API_BASE_URL from '../../utils/apiConfig';
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.socket = null;
        this.otherAvatars = {};
        this.avatarParts = {};
        this.avatarSprites = {};
        this.cursors = null;
        this.lastPosition = { x: 0, y: 0 };
        this.cameraFollow = true;
        this.mapScale = 1;
        this.clickableZones = [];
        this.roomHighlights = [];
        this.isDragging = false;
        this.isSceneReady = false;
        this.queuedAvatars = [];
    }

    preload() {
        this.load.image('campus', '/assets/campus.png');
        this.load.image('default-head', '/assets/avatar/head/male-head1.png');
        this.load.image('default-body', '/assets/avatar/body/male-body1.png');
        this.load.image('default-legs', '/assets/avatar/legs/male-legs1.png');
        this.load.image('male-head1.png', '/assets/avatar/head/male-head1.png');
        this.load.image('male-body1.png', '/assets/avatar/body/male-body1.png');
        this.load.image('male-legs1.png', '/assets/avatar/legs/male-legs1.png');
        this.load.image('male-head2.png', '/assets/avatar/head/male-head2.png');
        this.load.image('male-body2.png', '/assets/avatar/body/male-body2.png');
        this.load.image('male-legs2.png', '/assets/avatar/legs/male-legs2.png');
        this.load.image('male-head3.png', '/assets/avatar/head/male-head3.png');
        this.load.image('male-body3.png', '/assets/avatar/body/male-body3.png');
        this.load.image('male-legs3.png', '/assets/avatar/legs/male-legs3.png');
        this.load.image('male-head4.png', '/assets/avatar/head/male-head4.png');
        this.load.image('male-body4.png', '/assets/avatar/body/male-body4.png');
        this.load.image('male-legs4.png', '/assets/avatar/legs/male-legs4.png');
        this.load.image('female-head1.png', '/assets/avatar/head/female-head1.png');
        this.load.image('female-body1.png', '/assets/avatar/body/female-body1.png');
        this.load.image('female-legs1.png', '/assets/avatar/legs/female-legs1.png');
        this.load.image('female-head2.png', '/assets/avatar/head/female-head2.png');
        this.load.image('female-body2.png', '/assets/avatar/body/female-body2.png');
        this.load.image('female-legs2.png', '/assets/avatar/legs/female-legs2.png');
        this.load.image('female-head3.png', '/assets/avatar/head/female-head3.png');
        this.load.image('female-body3.png', '/assets/avatar/body/female-body3.png');
        this.load.image('female-legs3.png', '/assets/avatar/legs/female-legs3.png');
        this.load.image('female-head4.png', '/assets/avatar/head/female-head4.png');
        this.load.image('female-body4.png', '/assets/avatar/body/female-body4.png');
        this.load.image('female-legs4.png', '/assets/avatar/legs/female-legs4.png');
    }

    async create() {
        try {
            await this.fetchUserAvatar();
        } catch (err) {
            console.error("Error initializing avatar:", err);
        }
        this.createMap();
        this.createAvatar();
        this.setupCamera();
        this.setupControls();
        this.addClickableAreas();
        this.setupSocket();
        this.scale.on('resize', this.resizeGame, this);
        this.sceneReady = true;
        this.queuedAvatars.forEach(({ socketId, data }) => {
            this.addOtherAvatar(socketId, data);
        });
        this.queuedAvatars = [];
    }

    async fetchUserAvatar() {
        const defaultAvatar = {
            head: 'default-head',
            body: 'default-body',
            legs: 'default-legs',
        };

        try {
            const token = localStorage.getItem('x-auth-token');
            const userId = localStorage.getItem('userId'); // assuming it's stored after login

            if (!token || !userId) throw new Error("Missing token or userId");
            //const url = `${API_BASE_URL}/api/student/me`
            const url = `${API_BASE_URL}/api/student/me`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-auth-token': token,
                },
            });

            if (!response.ok) {
                console.warn("Failed to fetch avatar config, using defaults");
                console.log("using default avatar");
                this.avatarParts = defaultAvatar;
                return;
            }

            const data = await response.json(); // { head, body, legs }
            //console.log("Full response from api/stud/me:", data);
            this.avatarParts = {
                head: data.avatar?.head || defaultAvatar.head,
                body: data.avatar?.body || defaultAvatar.body,
                legs: data.avatar?.legs || defaultAvatar.legs,
            };
            //console.log("Using avatar parts:");
            //console.log("Head:", this.avatarParts.head);
            //console.log("Body:", this.avatarParts.body);
            //console.log("Legs:", this.avatarParts.legs);
            //console.log('Avatar parts loaded: ', this.avatarParts);
        } catch (error) {
            console.error("Error fetching avatar:", error);
            this.avatarParts = defaultAvatar;
        }
    }
    setupSocket() {
        if (this.socket && this.socket.connected) {
            console.warn('Socket already connected');
            return;
        }

        this.socket = io('http://192.168.29/159:5000'); // use your LAN IP

        const userId = localStorage.getItem('userId');

        this.socket.emit('join-game', {
            userId,
            avatarParts: this.avatarParts
        });

        // Receive already connected avatars
        this.socket.on('all-avatars', (users) => {
            for (const [socketId, data] of Object.entries(users)) {
                if (socketId !== this.socket.id) {
                    this.addOtherAvatar(socketId, data);
                }
            }
        });

        // New player joined
        this.socket.on('new-avatar', (data) => {
            if (data.socketId !== this.socket.id) {
                this.addOtherAvatar(data.socketId, data);
            }
        });

        // Player moved
        this.socket.on('update-avatar', ({ socketId, x, y }) => {
            /*const avatar = this.otherAvatars[socketId];
            if (avatar) {
                avatar.setPosition(x, y);
            }*/
                const otherAvatar = this.otherAvatars[socketId];
                if (otherAvatar) {
                    this.tweens.add({
                        targets: otherAvatar,
                        x,
                        y,
                        duration: 500,
                        ease: 'Power2'
                    });
                }
        });

        // Player left
        this.socket.on('remove-avatar', (socketId) => {
            if (this.otherAvatars[socketId]) {
                this.otherAvatars[socketId].destroy();
                delete this.otherAvatars[socketId];
            }
        });
    }
    addOtherAvatar(socketId, { x = 400, y = 300, avatarParts }) {
        if (!this.sceneReady || !this.add) {
            console.warn(`Scene not ready when trying to add avatar ${socketId}`);
            this.queuedAvatars.push({ socketId, data: { x, y, avatarParts } });
            return;
        }

        const container = this.add.container(x, y);
        const legs = this.add.sprite(1, 190, avatarParts.legs).setOrigin(0.5);
        const body = this.add.sprite(-5, 80, avatarParts.body).setOrigin(0.5);
        const head = this.add.sprite(0, -30, avatarParts.head).setOrigin(0.5);

        container.add([legs, body, head]);
        container.setScale(0.3);
        container.setDepth(10);

        this.otherAvatars[socketId] = container;
    }


    createMap() {
        this.map = this.add.image(0, 0, 'campus').setOrigin(0, 0);
        this.originalMapWidth = this.map.width;
        this.originalMapHeight = this.map.height;

        this.physics.world.setBounds(0, 0, this.map.width, this.map.height);
    }

    createAvatar() {
        this.avatarSprites = {};
        this.avatarContainer = this.add.container(400, 300);

        this.avatarSprites.legs = this.add.sprite(1, 160, this.avatarParts.legs).setOrigin(0.5);
        this.avatarSprites.body = this.add.sprite(-5, 80, this.avatarParts.body).setOrigin(0.5);
        this.avatarSprites.head = this.add.sprite(0, -30, this.avatarParts.head).setOrigin(0.5);
        //this.avatarSprites.head = this.add.sprite(0, -30, 'female-head1.png').setOrigin(0.5);
        this.avatarContainer.add([
            this.avatarSprites.legs,
            this.avatarSprites.body,
            this.avatarSprites.head,
        ]);

        this.physics.world.enable(this.avatarContainer);
        this.avatarContainer.body.setSize(40, 60).setOffset(-20, -30);
        this.avatarContainer.setDepth(10);
        this.avatarContainer.setScale(0.3);
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);
        this.cameras.main.startFollow(this.avatarContainer);
        this.resizeGame();
    }

    setupControls() {
        this.input.on('pointerdown', (pointer) => {
            const now = this.time.now;

            if (now - this.lastClickTime < 300) {
                const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                this.moveAvatarTo(worldPoint.x, worldPoint.y);
            }

            this.lastClickTime = now;
        });

        this.input.keyboard.on('keydown-R', () => {
            this.cameras.main.centerOn(this.avatarContainer.x, this.avatarContainer.y);
        });

        this.input.on('wheel', (pointer, dx, dy) => {
            const cam = this.cameras.main;
            cam.zoom = Phaser.Math.Clamp(cam.zoom - dy * 0.001, 0.5, 2);
        });

        this.input.on('pointermove', (pointer) => {
            if (!pointer.isDown) return;

            if (this.cameraFollow) {
                this.cameras.main.stopFollow();   // Stop following avatar
                this.cameraFollow = false;
            }

            this.isDragging = true;

            const dx = pointer.prevPosition.x - pointer.x;
            const dy = pointer.prevPosition.y - pointer.y;
            this.cameras.main.scrollX += dx / this.cameras.main.zoom;
            this.cameras.main.scrollY += dy / this.cameras.main.zoom;
        });
    }

    moveAvatarTo(x, y) {
        this.lastPosition = { x, y };

        this.tweens.add({
            targets: this.avatarContainer,
            x: x,
            y: y,
            duration: Phaser.Math.Distance.Between(
                this.avatarContainer.x,
                this.avatarContainer.y,
                x,
                y
            ) * 4,
            ease: 'Linear',
            onStart: () => {
                if (!this.cameraFollow) {
                    this.cameras.main.startFollow(this.avatarContainer);
                    this.cameraFollow = true;
                }
            },
            onComplete: () => {
                // 👇 SEND MOVEMENT TO SERVER
                /*this.socket.emit('move-avatar', {
                    x: this.avatarContainer.x,
                    y: this.avatarContainer.y
                });*/
                const { x, y } = this.avatarContainer;

                this.socket.emit('move-avatar', {
                    x,
                    y
                });
            }
        });
    }

    addClickableAreas() {
        this.clickableZones.forEach(zone => zone.destroy());
        this.roomHighlights.forEach(highlight => highlight.destroy());
        this.clickableZones = [];
        this.roomHighlights = [];

        clickableAreas[0].rooms.forEach(room => {
            this.createClickableZone(room);
            room.children?.forEach(child => this.createClickableZone(child));
        });
    }

    createClickableZone(area) {
        const { x, y, width, height } = area.rect;
        const scaledX = x * this.mapScale;
        const scaledY = y * this.mapScale;
        const scaledWidth = width * this.mapScale;
        const scaledHeight = height * this.mapScale;

        const zone = this.add.zone(scaledX, scaledY, scaledWidth, scaledHeight).setOrigin(0, 0).setInteractive();
        this.clickableZones.push(zone);
        zone.on('pointerover', () => {
            const highlight = this.add.rectangle(scaledX, scaledY, scaledWidth, scaledHeight, 0x00ff00, 0.3)
                .setOrigin(0, 0)
                .setDepth(5);
            this.roomHighlights.push(highlight);

            if (area.description) {
                const descText = this.add.text(
                    scaledX + scaledWidth / 2, // center X
                    scaledY - 5,              // just above the zone
                    area.description,
                    {
                        font: '12px Arial',
                        fill: '#ffffff',
                        backgroundColor: '#000000',
                        padding: { x: 4, y: 2 },
                        wordWrap: { width: 150 }
                    }
                )
                    .setOrigin(0.5, 1)
                    .setDepth(10);

                this.roomHighlights.push(descText);
            }
        });

        zone.on('pointerout', () => {
            this.roomHighlights.forEach(item => item.destroy());
            this.roomHighlights = [];
        });

        zone.on('pointerdown', () => {
            const centerX = scaledX + scaledWidth / 2;
            const centerY = scaledY + scaledHeight / 2;
            this.moveAvatarTo(centerX, centerY);
        });
    }

    resizeGame() {
        const { width, height } = this.scale;
        const scaleX = width / this.originalMapWidth;
        const scaleY = height / this.originalMapHeight;
        this.mapScale = Math.max(scaleX, scaleY);

        const scaledWidth = this.originalMapWidth * this.mapScale;
        const scaledHeight = this.originalMapHeight * this.mapScale;

        this.map.setDisplaySize(scaledWidth, scaledHeight);
        this.physics.world.setBounds(0, 0, scaledWidth, scaledHeight);

        // Update camera bounds
        this.cameras.main.setBounds(0, 0, scaledWidth, scaledHeight);

        // Clamp camera scroll to prevent showing beyond the map
        const cam = this.cameras.main;
        cam.scrollX = Phaser.Math.Clamp(cam.scrollX, 0, scaledWidth - cam.width / cam.zoom);
        cam.scrollY = Phaser.Math.Clamp(cam.scrollY, 0, scaledHeight - cam.height / cam.zoom);

        this.addClickableAreas();// refresh scaled zones
    }

    update() {
        // Future: Add animations or keyboard movement here
    }
}
