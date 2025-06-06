import * as THREE from "three"


export class Body{
    constructor(loader,model_name,scale,position,scene){
        this.loader = loader
        this.model_name = model_name
        this.scaleX = scale[0]
        this.scaleY = scale[1]
        this.scaleZ = scale[2]
        this.position = position
        if (position){
            this.positionX = position[0]
            this.positionY = position[1]
            this.positionZ = position[2]
        }

        this.scene = scene
        this.pivot = new THREE.Group()
        this.model = null
    }
    load(){
        this.loader.load(`./assets/models/${this.model_name}.glb`, (gltf) => {
            gltf.scene.scale.set(this.scaleX,this.scaleY,this.scaleZ)
            const box = new THREE.Box3().setFromObject(gltf.scene)
            const center = new THREE.Vector3()
            box.getCenter(center)

            gltf.scene.position.sub(center)

            if(this.position){
                gltf.scene.position.x = this.positionX
                gltf.scene.position.y = this.positionY
                gltf.scene.position.z = this.positionZ
            }
            
            
            this.pivot.add(gltf.scene)
            this.model = gltf.scene

            this.scene.add(this.pivot)
            
        }, undefined, function (err) {
            console.log(err);
        });
    }
}
export class Sun extends Body{
    constructor(loader,model_name,scale,scene){
        super(loader,model_name,scale,(0,0,0),scene)
    }



}