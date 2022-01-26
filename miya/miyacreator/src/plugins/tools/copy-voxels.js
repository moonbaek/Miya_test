export class CopyVoxels {
  meta = {
    alt: 'Copy voxels (O)',
    key: 'O',
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

    const rollOverGeo_select = new THREE.BoxBufferGeometry(50, 50, 50);
    const rollOverMaterial_select = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
      visible: false,
    });
    this.rollOverMesh_select = new THREE.Mesh(rollOverGeo_select, rollOverMaterial_select);    

    this.cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
    this.mainMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);

    this.start = null;
    this.voxels = [];

    this.minx=10000;
    this.miny=10000;
    this.minz=10000;
    this.maxx=-10000;
    this.maxy=-10000;
    this.maxz=-10000;
    this.flag = 0;
  }

  init() {
    this.scene.add(this.rollOverMesh);
    this.scene.add(this.rollOverMesh_select);

    this.renderer.domElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
    this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
  }

  destroy() {
    this.scene.remove(this.rollOverMesh);
    this.scene.remove(this.rollOverMesh_select);

    this.renderer.domElement.removeEventListener('mousemove', this.onDocumentMouseMove, false);
    this.renderer.domElement.removeEventListener('mousedown', this.onDocumentMouseDown, false);
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

    if (this.voxels.length > 0) {
      this.flag = 1;
      this.minx=10000;
          this.miny=10000;
          this.minz=10000;
          this.maxx=-10000;
          this.maxy=-10000;
          this.maxz=-10000;
          const minposition = new THREE.Vector3();
          const maxposition = new THREE.Vector3();
          this.voxels.forEach((voxel) => {
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
    else {
      this.flag = 0;
    }

    const intersects = this.raycaster.intersectObjects([...this.objects, ...this.sceneObjects]);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const currentPosition = new THREE.Vector3();
      currentPosition.copy(intersect.point).add(intersect.face.normal);
      currentPosition.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

      if (!this.start) {
        if(this.flag == 1){
          const minposition_area = new THREE.Vector3();
          const maxposition_area = new THREE.Vector3();         
          if((currentPosition.x == this.maxx) && ((currentPosition.y >= this.miny) && (currentPosition.y <= this.maxy)) && ((currentPosition.z >= this.minz) && (currentPosition.z <= this.maxz)))
          {
            console.log('area x !!!');
            minposition_area.copy(new THREE.Vector3(this.maxx , this.miny , this.minz));
            maxposition_area.copy(new THREE.Vector3(this.maxx , this.maxy , this.maxz));            
            const size = this.sizeFromVectors_area(minposition_area, maxposition_area,1);
            const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
            this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
            this.rollOverMesh.position.copy(this.centerBetweenVectors_area(minposition_area, maxposition_area,1));
            this.rollOverMesh.computeLineDistances();
          }
          
          else if((currentPosition.y == this.maxy) && ((currentPosition.x >= this.minx) && (currentPosition.y <= this.maxx)) && ((currentPosition.z >= this.minz) && (currentPosition.z <= this.maxz)))
          {
            console.log('area y !!!');
            minposition_area.copy(new THREE.Vector3(this.minx , this.maxy , this.minz));
            maxposition_area.copy(new THREE.Vector3(this.maxx , this.maxy , this.maxz));            
            const size = this.sizeFromVectors_area(minposition_area, maxposition_area,2);
            const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
            this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
            this.rollOverMesh.position.copy(this.centerBetweenVectors_area(minposition_area, maxposition_area,2));
            this.rollOverMesh.computeLineDistances();
          }
          else if((currentPosition.z == this.maxz) && ((currentPosition.y >= this.miny) && (currentPosition.y <= this.maxy)) && ((currentPosition.x >= this.minx) && (currentPosition.x <= this.maxx)))
          {
            console.log('area z !!!');
            minposition_area.copy(new THREE.Vector3(this.minx , this.miny , this.maxz));
            maxposition_area.copy(new THREE.Vector3(this.maxx , this.maxy , this.maxz));
            const size = this.sizeFromVectors_area(minposition_area, maxposition_area,3);
            const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
            this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
            this.rollOverMesh.position.copy(this.centerBetweenVectors_area(minposition_area, maxposition_area,3));
            this.rollOverMesh.computeLineDistances();
          }
        }
        else {
          this.rollOverMesh.material.visible = true;
          this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
          this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        }
        
      } else {
        if(this.flag == 0){
          const size = this.sizeFromVectors(this.start, currentPosition);
          const rollOverGeo = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
          this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
          this.rollOverMesh.position.copy(this.centerBetweenVectors(this.start, currentPosition));
          this.rollOverMesh.computeLineDistances();
        }
        else {
          //currentPosition.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
          this.rollOverMesh.position.copy(currentPosition);
          this.rollOverMesh.computeLineDistances();
        }
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

      if (!this.start) {
        console.log('mouse down!!! !this.start if moon!!!!');
        
        if (this.flag == 1)
        {
          const currentPosition = new THREE.Vector3();
          currentPosition.copy(intersect.point).add(intersect.face.normal);
          currentPosition.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
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
           else {
             console.log('out of area !!!! reset   area  !!!');
             this.voxels.splice(0, this.voxels.length);
           }
        }
        else {
          this.start = new THREE.Vector3();
          this.start.copy(intersect.point).add(intersect.face.normal);
          this.start.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        }
        
      } else if (!this.end) {
        console.log('mouse down!!! !this.end if moon!!!!');
        
        if(this.flag == 0)
        {
          const end = new THREE.Vector3();
          end.copy(intersect.point).add(intersect.face.normal);
          end.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
          const size = new THREE.Vector3();

          size.subVectors(end, this.start);
          size.set(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z));
          size.addScalar(50);

          this.selectVoxels(this.start, end, size);
        }
        else {
          const end = new THREE.Vector3();
          end.copy(intersect.point).add(intersect.face.normal);
          end.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
          const temp = new THREE.Vector3();
          temp.x = (this.minx + this.maxx)/2;
          temp.y = (this.miny + this.maxy)/2;
          temp.z = (this.minz + this.maxz)/2;
          // console.log('this.minx = ' + this.minx + 'this.maxx = '+this.maxx + 'temp.x = '+temp.x);
          // console.log('this.miny = ' + this.miny + 'this.maxy = '+this.maxy + 'temp.y = '+temp.y);
          // console.log('this.minz = ' + this.minz + 'this.maxz = '+this.maxz + 'temp.z = '+temp.z);
          temp.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
          const disvalue = new THREE.Vector3();
          disvalue.subVectors(end, temp);
          // console.log('end.x = ' + end.x + 'temp.x = '+temp.x + 'disvalue.x = '+disvalue.x);
          // console.log('end.y = ' + end.y + 'temp.y = '+temp.y + 'disvalue.y = '+disvalue.y);
          // console.log('end.z = ' + end.z + 'temp.z = '+temp.z + 'disvalue.z = '+disvalue.z);
          let voxels_tmp = [];
          this.voxels.forEach((voxel) => {
            voxel.position.x = voxel.position.x + disvalue.x;
            //voxel.position.y = voxel.position.y + disvalue.y;
            voxel.position.z = voxel.position.z + disvalue.z;
            voxels_tmp.push(voxel);
          });

          for(let count = 0; count < voxels_tmp.length; count += 1)
          {
            this.scene.add(voxels_tmp[count]);
            this.sceneObjects.push(voxels_tmp[count]);
          }

          this.voxels.splice(0, this.voxels.length);
          voxels_tmp.splice(0, voxels_tmp.length);
          this.flag = 0;
          // this.minx=10000;
          // this.miny=10000;
          // this.minz=10000;
          // this.maxx=-10000;
          // this.maxy=-10000;
          // this.maxz=-10000;
        }
        this.start = null;
        const rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50);
        this.rollOverMesh.geometry = new THREE.EdgesGeometry(rollOverGeo);
        this.rollOverMesh.computeLineDistances();

        this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        

        this.render();
      }
    }
  }

  selectVoxels(start, end, commonSize) {
    const { THREE } = this;

    let min_temp_y = 10000;
    let max_temp_y = -10000;

    this.sceneObjects.forEach((voxel) => {
      if(voxel.position.y < min_temp_y) min_temp_y=voxel.position.y;
      if(voxel.position.y > max_temp_y) max_temp_y=voxel.position.y;
    });
    const xSegments = commonSize.x / 50;
    const ySegments = max_temp_y / 50;
    const zSegments = commonSize.z / 50;

    

    const minX = Math.min(start.x, end.x);
    const minY = min_temp_y;//Math.min(start.y, end.y);
    const minZ = Math.min(start.z, end.z);
    for (let x = 0; x < xSegments; x += 1) {
      for (let y = 0; y < ySegments; y += 1) {
        for (let z = 0; z < zSegments; z += 1) {
          const voxel_tmp = new THREE.Mesh(this.cubeGeo, this.mainMaterial.clone());
          voxel_tmp.position.copy(new THREE.Vector3(minX + x * 50, minY + y * 50, minZ + z * 50));
          this.sceneObjects.forEach((voxel) => {
            if((voxel.position.x == voxel_tmp.position.x) && (voxel.position.y == voxel_tmp.position.y) && (voxel.position.z == voxel_tmp.position.z))
              this.voxels.push(voxel_tmp);
          });
        }
      }
    }
    this.voxels.forEach((voxel) => {
      console.log('voxel.position x = ' + voxel.position.x + ' y = ' + voxel.position.y +  ' z =' + voxel.position.z);
    });
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
}
