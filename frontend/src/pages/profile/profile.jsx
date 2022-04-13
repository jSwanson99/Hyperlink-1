import React, { createRef } from 'react';
import InputForm from '../../components/input-form/input-form'
import { modifyUser, uploadImage} from '../../firebase/fb-user-functions';
import { getStorage, ref, getDownloadURL} from 'firebase/storage'
import './profile.css'

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.employerFields = ['name', 'username', 'company name'];
        this.employerTypes = ['text', 'text', 'text'];
        this.employeeFields = ['name', 'email', 'skills', 'about me', 'github', 'linkedin'];
        this.employeeTypes = ['text', 'text', 'text', 'textarea', 'text', 'text'];

        this.form = createRef();
        this.state = {
            user: this.props.user || null,
            imageURL: null,
            imageFile: null
        };
    }

    componentDidMount() {
        const storage = getStorage()
        const imageFolderRef = ref(storage, this.state.user.uid + '/profile_pic')
        getDownloadURL(imageFolderRef).then((downloadFileURL) => {
            this.setState({
                imageURL: downloadFileURL
            })
        })
    }

    static getDerivedStateFromProps = (nextProps) => {
        return({
            user: nextProps.user
        });  
    }

    isEmployee = () => this.state.user.employee;

    modifyPressed = () => { 
        const form = this.form.current;
        const oldUser = this.state.user;
        
        var newUser = {}

        if(this.isEmployee()) {
            newUser = {
                ...oldUser,
                ...form.state.user,
                skills: form.state.user.skills.split(' ')
            };
        } else { 
            newUser = {
                ...oldUser,
                ...form.state.user,
            };
        }

        // update user document 
        modifyUser(this.state.user, newUser).then((success) => {
            if(success) { 
                this.props.login(newUser || {})
            }
        })
    }
    
    deletePressed = () => { 
        //const user = this.state.user;
        this.props.login(null);
    }

    handleUploadImage = (event) => { 
        // upload photo. Only change privew of photo if success uploading.
        uploadImage(this.state.user, event.target.files[0]).then((success) => {
            if(success) { 
                this.setState({
                    imageURL: URL.createObjectURL(event.target.files[0]),
                    imageFile: event.target.files[0]
                })
            }
        })
    }

    render() {
        const user = {
            ...this.state.user,
            skills: this.state.user.skills.join(' ')
        };
        return(
            <div id='profile'>
            <h3>User Profile</h3>
            <h6>{this.state.user.name}</h6>
            <div id='profileImageDiv'>
                <input name='title' id='uploadInput' type='file' onChange={this.handleUploadImage}/>
                <img id='profileImage' src={this.state.imageURL} alt='profile_picture'/>
            </div>
            
            <InputForm
                pageType={'PROFILE'}
                inputs={this.isEmployee() ? this.employeeFields : this.employerFields}
                types={this.isEmployee() ? this.employeeTypes : this.employerTypes}
                values={user}
                buttons={[{ name: 'Modify Profile', callback: this.modifyPressed },
                            { name: 'Delete Account', callback: this.deletePressed }]}
                ref={this.form} 
            />
            </div>
        );
    }
}

export default Profile;