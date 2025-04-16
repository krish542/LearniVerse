import Phaser from 'phaser';
import clickableAreas from './clickableAreas';

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.avatar = null;
        this.cursors = null;
        this.isDragging = false;
        this.startPointerX = 0;
        this.startPointerY = 0;
        this.startCameraScrollX = 0;
        this.startCameraScrollY = 0;
        this.lastClickTime = 0;
        this.dragThreshold = 10;
        this.map = null;
        
        // Interactive features
        this.interactiveZones = [];
        this.hoverText = null;
        this.currentRoom = null;
    }

    preload() {
        this.load.image('campus-map', 'assets/campus.png');
        this.load.image('male-head1', 'assets/avatar/head/male-head1.png');
        this.load.image('male-body1', 'assets/avatar/body/male-body1.png');
        this.load.image('male-legs1', 'assets/avatar/legs/male-legs1.png');
    }

    create() {
        // Create map
        this.map = this.add.image(0, 0, 'campus-map').setOrigin(0);
        const scaleX = this.cameras.main.width / this.map.width;
        const scaleY = this.cameras.main.height / this.map.height;
        const scale = Math.max(scaleX, scaleY);
        this.map.setScale(scale).setOrigin(0);

        // Create avatar
        this.createAvatar({
            head: 'male-head1',
            body: 'male-body1',
            legs: 'male-legs1'
        });

        // Setup camera
        this.cameras.main.setBounds(0, 0, this.map.displayWidth, this.map.displayHeight);
        this.cameras.main.startFollow(this.avatar, false, 0.1, 0.1);
        this.cameras.main.setZoom(1);
        this.cameras.main.setFollowOffset(0, 0);

        // Setup controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Setup interactive features
        this.setupInteractiveFeatures();

        // Setup input handlers
        this.setupInputHandlers();

        // Handle window resize
        this.scale.on('resize', this.resize, this);
    }

    setupInteractiveFeatures() {
        // Create hover text
        this.hoverText = this.add.text(10, 10, '', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setDepth(100).setVisible(false);

        // Create interactive zones
        this.createInteractiveZones();
    }

    createInteractiveZones() {
        // Clear existing zones
        this.interactiveZones = [];

        // Check if clickableAreas exists and has rooms
        if (!clickableAreas || !clickableAreas[0] || !clickableAreas[0].rooms) {
            console.warn('No valid clickable areas found');
            return;
        }

        // Create zones for each room and its children
        clickableAreas[0].rooms.forEach(room => {
            if (!room || !room.rect) return;

            // Create room zone
            const roomZone = this.add.zone(
                room.rect.x, 
                room.rect.y, 
                room.rect.width, 
                room.rect.height
            ).setOrigin(0);

            roomZone.setData({
                type: 'room',
                id: room.id,
                label: room.label,
                interactiveType: room.interactiveType || 'both'
            });

            roomZone.setInteractive({
                hitArea: new Phaser.Geom.Rectangle(0, 0, room.rect.width, room.rect.height),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                cursor: 'pointer'
            });

            this.interactiveZones.push(roomZone);

            // Create children zones if they exist
            if (room.children && room.children.length > 0) {
                room.children.forEach(child => {
                    if (!child || !child.rect) return;

                    const childZone = this.add.zone(
                        child.rect.x,
                        child.rect.y,
                        child.rect.width,
                        child.rect.height
                    ).setOrigin(0);

                    childZone.setData({
                        type: child.type,
                        id: child.id,
                        parentId: room.id,
                        interactiveType: child.interactiveType || 'both'
                    });

                    childZone.setInteractive({
                        hitArea: new Phaser.Geom.Rectangle(0, 0, child.rect.width, child.rect.height),
                        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                        cursor: 'pointer'
                    });

                    // Initially disable children (enable when avatar enters room)
                    childZone.disableInteractive();
                    this.interactiveZones.push(childZone);
                });
            }
        });
    }

    setupInputHandlers() {
        // Dragging controls
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.isDragging = true;
                this.startPointerX = pointer.x;
                this.startPointerY = pointer.y;
                this.startCameraScrollX = this.cameras.main.scrollX;
                this.startCameraScrollY = this.cameras.main.scrollY;
                this.cameras.main.stopFollow();
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                const dx = (pointer.x - this.startPointerX) / this.cameras.main.zoom;
                const dy = (pointer.y - this.startPointerY) / this.cameras.main.zoom;
                
                this.cameras.main.scrollX = this.startCameraScrollX - dx;
                this.cameras.main.scrollY = this.startCameraScrollY - dy;
            } else {
                // Handle hover when not dragging
                this.handleHover(pointer);
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.isDragging) {
                const distanceMoved = Phaser.Math.Distance.Between(
                    this.startPointerX,
                    this.startPointerY,
                    pointer.x,
                    pointer.y
                );

                if (distanceMoved < this.dragThreshold) {
                    const currentTime = this.time.now;
                    const timeDiff = currentTime - this.lastClickTime;

                    if (pointer.leftButtonReleased() && timeDiff < 250) {
                        this.moveAvatarTo(pointer.worldX, pointer.worldY);
                    }

                    this.lastClickTime = currentTime;
                }

                this.isDragging = false;
                this.cameras.main.startFollow(this.avatar, false, 0.1, 0.1);
            } else {
                // Handle click when not dragging
                this.handleClick(pointer);
            }
        });

        // Mouse wheel for scrolling
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (!this.cameras.main._follow) {
                this.cameras.main.scrollX -= deltaX * 0.5;
                this.cameras.main.scrollY += deltaY * 0.5;
            }
        });
    }

    handleHover(pointer) {
        this.hoverText.setVisible(false);
        
        // Update current room based on avatar position
        this.updateCurrentRoom();

        // Check all interactive zones
        this.interactiveZones.forEach(zone => {
            if (!zone.input || !zone.input.hitArea) return;

            const zoneData = zone.getData();
            if (!zoneData) return;

            // Check if pointer is over this zone
            if (Phaser.Geom.Rectangle.Contains(
                new Phaser.Geom.Rectangle(
                    zone.x,
                    zone.y,
                    zone.input.hitArea.width,
                    zone.input.hitArea.height
                ),
                pointer.worldX,
                pointer.worldY
            )) {
                // Check if we should show hover for this zone
                if ((zoneData.interactiveType === 'hover' || zoneData.interactiveType === 'both') &&
                    (zoneData.type === 'room' || 
                     (this.currentRoom && zoneData.parentId === this.currentRoom.getData('id')))) {
                    
                    const hoverMessage = this.getHoverMessage(zoneData);
                    this.hoverText.setText(hoverMessage)
                        .setPosition(pointer.x + 15, pointer.y + 15)
                        .setVisible(true);
                }
            }
        });
    }

    getHoverMessage(zoneData) {
        switch(zoneData.type) {
            case 'room': return `Enter ${zoneData.label}`;
            case 'chair': return 'Sit here';
            case 'stage': return 'Perform on stage';
            case 'banner': return 'View club information';
            case 'board': return 'View classroom updates';
            case 'screen': return 'View presentation';
            case 'books': return 'Browse study materials';
            case 'waiting_area': return 'Wait for your turn';
            default: return `Interact with ${zoneData.label || zoneData.type}`;
        }
    }

    handleClick(pointer) {
        this.interactiveZones.forEach(zone => {
            if (!zone.input || !zone.input.hitArea) return;

            const zoneData = zone.getData();
            if (!zoneData) return;

            // Check if pointer clicked this zone
            if (Phaser.Geom.Rectangle.Contains(
                new Phaser.Geom.Rectangle(
                    zone.x,
                    zone.y,
                    zone.input.hitArea.width,
                    zone.input.hitArea.height
                ),
                pointer.worldX,
                pointer.worldY
            )) {
                // Check if we should handle click for this zone
                if ((zoneData.interactiveType === 'click' || zoneData.interactiveType === 'both') &&
                    (zoneData.type === 'room' || 
                     (this.currentRoom && zoneData.parentId === this.currentRoom.getData('id')))) {
                    
                    console.log(`Clicked on ${zoneData.type}: ${zoneData.id}`);
                    this.game.events.emit('showModal', {
                        type: zoneData.type,
                        id: zoneData.id,
                        label: zoneData.label || `${zoneData.type} ${zoneData.id}`
                    });
                }
            }
        });
    }

    updateCurrentRoom() {
        if (!this.avatar) return;

        let closestRoom = null;
        let closestDistance = Infinity;

        this.interactiveZones.forEach(zone => {
            const zoneData = zone.getData();
            if (!zoneData || zoneData.type !== 'room') return;

            const roomCenterX = zone.x + (zone.input?.hitArea?.width || 0) / 2;
            const roomCenterY = zone.y + (zone.input?.hitArea?.height || 0) / 2;
            const distance = Phaser.Math.Distance.Between(
                this.avatar.x, 
                this.avatar.y, 
                roomCenterX, 
                roomCenterY
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestRoom = zone;
            }
        });

        // Update current room if within threshold (100 pixels)
        if (closestDistance < 100) {
            if (this.currentRoom !== closestRoom) {
                this.currentRoom = closestRoom;
                this.updateRoomChildrenInteractivity();
            }
        } else if (this.currentRoom !== null) {
            this.currentRoom = null;
            this.updateRoomChildrenInteractivity();
        }
    }

    updateRoomChildrenInteractivity() {
        this.interactiveZones.forEach(zone => {
            const zoneData = zone.getData();
            if (!zoneData || zoneData.type === 'room') return;

            if (this.currentRoom && zoneData.parentId === this.currentRoom.getData('id')) {
                zone.setInteractive();
            } else {
                zone.disableInteractive();
            }
        });
    }

    resize(gameSize) {
        const { width, height } = gameSize;
        this.cameras.resize(width, height);
        
        const scaleX = width / this.map.width;
        const scaleY = height / this.map.height;
        const scale = Math.max(scaleX, scaleY);
        this.map.setScale(scale).setOrigin(0);
        
        this.cameras.main.setBounds(0, 0, this.map.displayWidth, this.map.displayHeight);
    }

    update() {
        // Handle avatar movement
        if (this.avatar && this.cursors && !this.isDragging) {
            this.avatar.body.setVelocity(0);

            if (this.cursors.left.isDown) {
                this.avatar.body.setVelocityX(-160);
            } else if (this.cursors.right.isDown) {
                this.avatar.body.setVelocityX(160);
            }

            if (this.cursors.up.isDown) {
                this.avatar.body.setVelocityY(-160);
            } else if (this.cursors.down.isDown) {
                this.avatar.body.setVelocityY(160);
            }
        }

        // Update current room detection
        this.updateCurrentRoom();
    }

    createAvatar(config) {
        this.avatar = this.add.container(100, 100);

        const legs = this.add.image(0, 20, config.legs).setScale(0.4);
        const body = this.add.image(0, 0, config.body).setScale(0.4);
        const head = this.add.image(0, -35, config.head).setScale(0.2);

        this.avatar.add(legs);
        this.avatar.add(body);
        this.avatar.add(head);

        this.physics.add.existing(this.avatar);
        this.avatar.body.setCollideWorldBounds(false);
    }

    moveAvatarTo(x, y) {
        this.tweens.add({
            targets: this.avatar,
            x: x,
            y: y,
            duration: 1000,
            ease: 'Linear',
        });
    }
}

export default MainScene;