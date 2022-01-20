export class MoveVoxels {
  meta = {
    alt: 'Move voxels (V)',
    key: 'V',
  }
  
  constructor(configs) {
    const { THREE } = configs;
    this.THREE = THREE;

    this.scene = configs.scene;
    this.renderer = configs.renderer;
    this.camera = configs.camera;
    this.objects = configs.objects;
    this.sceneObjects = configs.sceneObjects;
    this.render = configs.render;
    this.rect = configs.rect;

    this.enabled = true;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    const rollOverMaterial = new THREE.LineDashedMaterial({
      color: 0xFFFF00,
      opacity: 3.0,
      transparent: true,
      visible: false,
    });
    this.rollOverMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(rollOverGeo), rollOverMaterial,
    );
    this.rollOverMesh.computeLineDistances();

    this.cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    this.mainMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
    //this.onDocumentMouseWheel = this.onDocumentMouseWheel.bind(this); // to do

    this.start = null;
    this.voxels = [];
    
    this.minx=10000;
    this.miny=10000;
    this.minz=10000;
    this.maxx=-10000;
    this.maxy=-10000;
    this.maxz=-10000;
    
  }

  init() {
    this.scene.add(this.rollOverMesh);

    this.renderer.domElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
    this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
    //this.renderer.domElement.addEventListener('wheel', this.onDocumentMouseWheel, false); // to do
  }

  destroy() {
    this.scene.remove(this.rollOverMesh);

    this.renderer.domElement.removeEventListener('mousemove', this.onDocumentMouseMove, false);
    this.renderer.domElement.removeEventListener('mousedown', this.onDocumentMouseDown, false);
    //this.renderer.domElement.removeEventListener('wheel', this.onDocumentMouseWheel, false); // to do
    this.render();
  }

  onDocumentMouseMove(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    const { THREE } = this;

    this.mouse.set(
      ((event.clientX - this.rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.renderer.domElement.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([...this.objects, ...this.sceneObjects]);
    
    if (this.sceneObjects.length > 0) {
      this.minx=10000;
      this.miny=10000;
      this.minz=10000;
      this.maxx=-10000;
      this.maxy=-10000;
      this.maxz=-10000;
      const minposition = new THREE.Vector3();
      const maxposition = new THREE.Vector3();
      this.sceneObjects.forEach((voxel) => {
          if(voxel.position.x < this.minx) this.minx=voxel.position.x;
          if(voxel.position.y < this.miny) this.miny=voxel.position.y;
          if(voxel.position.z < this.minz) this.minz=voxel.position.z;
          if(voxel.position.x > this.maxx) this.maxx=voxel.position.x;
          if(voxel.position.y > this.maxy) this.maxy=voxel.position.y;
          if(voxel.position.z > this.maxz) this.maxz=voxel.position.z;
      });
      this.rollOverMesh.material.visible = true;
      minposition.copy(new THREE.Vector3(this.minx , this.miny , this.minz));
      maxposition.copy(new THREE.Vector3(this.maxx , this.maxy , this.maxz));
      const size = this.sizeFromVectors(minposition, maxposition);
      const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
      this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
      this.rollOverMesh.position.copy(this.centerBetweenVectors(minposition, maxposition));
      this.rollOverMesh.computeLineDistances();
    }
    
    if (intersects.length > 0) {
      this.rollOverMesh.material.visible = false;
      const intersect = intersects[0];
      const currentPosition = new THREE.Vector3();
      currentPosition.copy(intersect.point).add(intersect.face.normal);
      currentPosition.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      if(!this.start)
      {
        //console.log('move start!!!!!!!!!! this.minx = '+this.minx+'this.maxx ='+this.maxx+'current.x='+currentPosition.x);
        if((currentPosition.x == this.maxx) && ((currentPosition.y >= this.miny) && (currentPosition.y <= this.maxy)) && ((currentPosition.z >= this.minz) && (currentPosition.z <= this.maxz)))
        {
          console.log('area x !!!');
          this.rollOverMesh.material.visible = true;
          const minposition_x_area = new THREE.Vector3();
          const maxposition_x_area = new THREE.Vector3();
          minposition_x_area.copy(new THREE.Vector3(this.maxx , this.miny , this.minz));
          maxposition_x_area.copy(new THREE.Vector3(this.maxx , this.maxy , this.maxz));
          const size = this.sizeFromVectors_area(minposition_x_area, maxposition_x_area,1);

          const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
          this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
          this.rollOverMesh.position.copy(this.centerBetweenVectors_area(minposition_x_area, maxposition_x_area,1));
          this.rollOverMesh.computeLineDistances();
        }
        
        else if((currentPosition.y == this.maxy) && ((currentPosition.x >= this.minx) && (currentPosition.y <= this.maxx)) && ((currentPosition.z >= this.minz) && (currentPosition.z <= this.maxz)))
        {
          console.log('area y !!!');
          this.rollOverMesh.material.visible = true;
          const minposition_y_area = new THREE.Vector3();
          const maxposition_y_area = new THREE.Vector3();
          minposition_y_area.copy(new THREE.Vector3(this.minx , this.maxy , this.minz));
          maxposition_y_area.copy(new THREE.Vector3(this.maxx , this.maxy , this.maxz));
          const size = this.sizeFromVectors_area(minposition_y_area, maxposition_y_area,2);
          const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
          this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
          this.rollOverMesh.position.copy(this.centerBetweenVectors_area(minposition_y_area, maxposition_y_area,2));
          this.rollOverMesh.computeLineDistances();
        }
        else if((currentPosition.z == this.maxz) && ((currentPosition.y >= this.miny) && (currentPosition.y <= this.maxy)) && ((currentPosition.x >= this.minx) && (currentPosition.x <= this.maxx)))
        {
          console.log('area z !!!');
          this.rollOverMesh.material.visible = true;
          const minposition_z_area = new THREE.Vector3();
          const maxposition_z_area = new THREE.Vector3();
          minposition_z_area.copy(new THREE.Vector3(this.minx , this.miny , this.maxz));
          maxposition_z_area.copy(new THREE.Vector3(this.maxx , this.maxy , this.maxz));
          const size = this.sizeFromVectors_area(minposition_z_area, maxposition_z_area,3);
          const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
          this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
          this.rollOverMesh.position.copy(this.centerBetweenVectors_area(minposition_z_area, maxposition_z_area,3));
          this.rollOverMesh.computeLineDistances();
        }
      } else {

      }

      
      
    } 
    this.render();
  }

  onDocumentMouseDown(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    const { THREE } = this;

    this.mouse.set(
      ((event.clientX - this.rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
      -((event.clientY - this.rect.top) / this.renderer.domElement.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([...this.objects, ...this.sceneObjects]);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const currentPosition = new THREE.Vector3();
      currentPosition.copy(intersect.point).add(intersect.face.normal);
      currentPosition.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      if (!this.start) {
        if((currentPosition.x == this.maxx) && ((currentPosition.y >= this.miny) && (currentPosition.y <= this.maxy)) && ((currentPosition.z >= this.minz) && (currentPosition.z <= this.maxz)))
        {
          console.log('mouse down !!!! area x !!!');
          this.start = new THREE.Vector3();
          this.start.copy(intersect.point).add(intersect.face.normal);
          this.start.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        }
        
        else if((currentPosition.y == this.maxy) && ((currentPosition.x >= this.minx) && (currentPosition.y <= this.maxx)) && ((currentPosition.z >= this.minz) && (currentPosition.z <= this.maxz)))
        {
          console.log('mouse down !!!! area y !!!');
          this.start = new THREE.Vector3();
          this.start.copy(intersect.point).add(intersect.face.normal);
          this.start.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        }
        else if((currentPosition.z == this.maxz) && ((currentPosition.y >= this.miny) && (currentPosition.y <= this.maxy)) && ((currentPosition.x >= this.minx) && (currentPosition.x <= this.maxx)))
        {
          console.log('mouse down !!!! area z !!!');
          this.start = new THREE.Vector3();
          this.start.copy(intersect.point).add(intersect.face.normal);
          this.start.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        }
      }
      else if (!this.end) {
        const end = new THREE.Vector3();
        end.copy(intersect.point).add(intersect.face.normal);
        end.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

        const temp = new THREE.Vector3();
        
        temp.x = (this.minx + this.maxx)/2;
        temp.y = (this.miny + this.maxy)/2;
        temp.z = (this.minz + this.maxz)/2;
        temp.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        const disvalue = new THREE.Vector3();
        disvalue.subVectors(end, temp);

        this.sceneObjects.forEach((voxel) => {
          voxel.position.x = voxel.position.x + disvalue.x;
          voxel.position.y = voxel.position.y + disvalue.y + 50;
          voxel.position.z = voxel.position.z + disvalue.z;
          this.voxels.push(voxel);
        });

        this.clearScene();

        for(let count = 0; count < this.voxels.length; count += 1)
        {
          this.scene.add(this.voxels[count]);
          this.sceneObjects.push(this.voxels[count]);
        }

        this.voxels.splice(0, this.voxels.length);
        this.start = null;
      }
      this.render();
    }
    
  }

  onDocumentMouseWheel(event) {
    console.log(event);
  }

  sizeFromVectors(a, b) {
    const { THREE } = this;
    const size = new THREE.Vector3();
    size.subVectors(b, a);
    size.set(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z));
    size.addScalar(50);
    return size;
  }

  sizeFromVectors_area(a, b,area) {
    const { THREE } = this;
    const size = new THREE.Vector3();
    size.subVectors(b, a);
    size.set(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z));
    size.addScalar(50);
    if(area == 1 )size.x = 0;
    else if (area == 2)size.y=0;
    else if(area ==3)size.z=0;
    return size;
  }

  centerBetweenVectors(a, b) {
    let dir = b.clone().sub(a);
    const len = dir.length();
    dir = dir.normalize().multiplyScalar(len * 0.5);
    return a.clone().add(dir);
  }

  centerBetweenVectors_area(a, b, area) {
    let dir = b.clone().sub(a);
    const len = dir.length();
    dir = dir.normalize().multiplyScalar(len * 0.5);
    const temp = a.clone().add(dir);
    if(area == 1)temp.x = temp.x+25;
    else if(area == 2)temp.y = temp.y+25;
    else if(area == 3)temp.z = temp.z+25;
    return temp;
  }

  clearScene() {
    this.scene.remove(...this.sceneObjects);
    this.sceneObjects.splice(0, this.sceneObjects.length);
  }

}

