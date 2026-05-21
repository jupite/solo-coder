import * as THREE from 'three';
import { GAME_CONFIG } from '../config/config.js';
import { Note } from './Note.js';

export class NoteManager {
  constructor(scene) {
    this.scene = scene;
    this.notes = [];
    this.spawnTimer = 0;
    this.nextSpawnTime = this.getRandomSpawnInterval();
  }

  init() {
    this.createLanes();
  }

  createLanes() {
    GAME_CONFIG.LANES.forEach((lane) => {
      const laneGeometry = new THREE.CylinderGeometry(0.02, 0.02, 12, 8);
      const laneMaterial = new THREE.MeshBasicMaterial({
        color: lane.color,
        transparent: true,
        opacity: 0.15
      });
      const laneMesh = new THREE.Mesh(laneGeometry, laneMaterial);
      laneMesh.position.set(lane.position, 4, 0);
      this.scene.add(laneMesh);
    });
  }

  getRandomSpawnInterval() {
    return GAME_CONFIG.SPAWN.minInterval + Math.random() * (GAME_CONFIG.SPAWN.maxInterval - GAME_CONFIG.SPAWN.minInterval);
  }

  spawnNote() {
    const laneIndex = Math.floor(Math.random() * GAME_CONFIG.LANES.length);
    const lane = GAME_CONFIG.LANES[laneIndex];
    const note = new Note(laneIndex, lane.color, lane.position);
    this.notes.push(note);
    this.scene.add(note.mesh);
  }

  update(delta) {
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.spawnNote();
      this.spawnTimer = 0;
      this.nextSpawnTime = this.getRandomSpawnInterval();
    }

    this.notes.forEach((note) => {
      note.update(delta);
    });

    this.notes = this.notes.filter((note) => {
      if (!note.isActive) {
        this.scene.remove(note.mesh);
        return false;
      }
      return true;
    });
  }

  checkHit(laneIndex) {
    for (const note of this.notes) {
      if (note.laneIndex === laneIndex && note.checkHit()) {
        return note;
      }
    }
    return null;
  }

  checkMisses() {
    const missedNotes = [];
    this.notes.forEach((note) => {
      if (note.hasMissed()) {
        missedNotes.push(note);
        note.isActive = false;
      }
    });
    return missedNotes;
  }

  getNotesInLane(laneIndex) {
    return this.notes.filter((note) => note.laneIndex === laneIndex && note.isActive);
  }
}
