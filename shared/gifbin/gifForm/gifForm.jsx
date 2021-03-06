
var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var moment = require('moment');

var Utils = require('gifbin/utils');


var ClipboardButton = require('gifbin/clipboardButton/clipboardButton.jsx');
var BucketSelect = require('gifbin/form/bucketSelect/bucketSelect.jsx');

var GifActions = require('gifbin/gif.actions.js');
var GifStore = require('gifbin/gif.store.js');


var randomBucketImg = _.sample(GifStore.getBuckets()).img;

var GifForm = React.createClass({
	mixins : [GifStore.mixin()],
	onStoreChange  : function(){
		this.setState({
			originalGif : GifStore.getGif(this.state.gif.id),
			loggedinUser : GifStore.getUser(),
			status : GifStore.getStatus()
		});
	},


	getDefaultProps: function() {
		return {
			placeholder : _.sampleSize([
				"tacos",
				"thumbs up",
				"you got to be kidding me",
				"Micheal Cera",
				"Cereal flip",
				"adventure time",
				"not a sloth lolz",
				"Feeling It",
				"umad",
				"you're god damn right",
				"oh no he didn't"
				], _.random(3,5)).join(', ')
		};
	},

	getInitialState: function() {
		var gif;
		if(this.props.gif){
			gif = JSON.parse(JSON.stringify(this.props.gif));
		}else{
			gif = {
				originalLink: this.convertLinkToGif(Utils.getImageFromUrl()),
				//user : GifStore.getUser(),
				tags : "",
				favs : [],
				buckets : []
			}
		}
		return {
			originalGif : Object.assign({}, gif),
			gif : gif,
			status : GifStore.getStatus()
		};
	},

	convertLinkToGif : function(linkPath){
		return (linkPath || "").replace('.webm', '.gif').replace('.gifv', '.gif')
	},

	//Maybe move into the button renderer
	isValid : function(){
		if(_.isEqual(this.state.gif, this.state.originalGif)){
			return false;
		}
		var gif = this.state.gif;
		return !!(gif.originalLink &&
			(gif.user || this.state.loggedinUser) &&
			(gif.tags || gif.buckets.length));
	},
	isFav : function(){
		return this.state.originalGif &&
			this.state.originalGif.favs &&
			_.includes(this.state.originalGif.favs, this.state.loggedinUser);
	},


	handleLoginClick : function(){
		GifActions.login()
	},
	handleLinkChange : function(e){
		this.state.gif.originalLink = this.convertLinkToGif(e.target.value);
		this.setState({
			gif : this.state.gif
		});
	},
	handleTagChange : function(e){
		this.state.gif.tags = e.target.value
		this.setState({
			gif : this.state.gif
		});
	},
	handleBucketChange : function(buckets){
		this.state.gif.buckets = buckets;
		this.setState({
			gif : this.state.gif
		});
	},
	handleSave : function(){
		if(!this.state.gif.user) this.state.gif.user = this.state.loggedinUser;

		var isEditMode = !!this.state.gif.id;

		if(isEditMode){
			GifActions.updateGif(this.state.gif, function(res){
				window.location = '/edit/' + res.body.id;
			});
		}else{
			GifActions.saveGif(this.state.gif, function(res){
				window.location = '/edit/' + res.body.id;
			});
		}
	},
	handleDelete : function(){
		if(confirm("Are you suuuuure you want to delete this?")){
			if(confirm("Are you really really sure?")){
				GifActions.deleteGif(this.state.gif.id, function(res){
					window.location = '/';
				})
			}
		}
	},
	handleFavClick : function(){
		if(this.isFav()){
			GifActions.unfavGif(this.state.gif);
			//this.state.gif.favs = _.without(this.state.gif.favs, this.state.loggedinUser);
		}else{
			GifActions.favGif(this.state.gif);
			//this.state.gif.favs.push(this.state.loggedinUser);
		}
		this.setState({
			//gif : this.state.gif
		})
	},


	///////Renders

	renderLink : function(){
		if(this.state.gif.id){
			return [
				<div className='link'>{this.state.gif.gifLink}</div>,
				<ClipboardButton link={this.state.gif.gifLink}></ClipboardButton>
			];
		}else{
			return <input className='link' type='text' value={this.state.gif.originalLink} onChange={this.handleLinkChange} />
		}
	},
	renderUser : function(){
		//Edit Mode
		if(this.state.gif.id){
			return [
				<label>by</label>,
				<div className='userName'>
					<a href={'/users/' + this.state.gif.user} target="_blank">
						{this.state.gif.user}
						<i className='fa fa-external-link' />
					</a>
				</div>
			];
		}

		//Create Mode
		if (this.state.loggedinUser){
			return [
				<label>user</label>,
				<div className='userName'>
					<a href={'/users/' + this.state.loggedinUser} target="_blank">
						{this.state.loggedinUser}
						<i className='fa fa-external-link' />
					</a>
				</div>
			];
		}else{
			return [
				<label>user</label>,
				<button className='login' onClick={this.handleLoginClick}>
					<i className='fa fa-sign-in' /> login
				</button>
			]
		}
	},
	renderViews : function(){
		if(!this.state.gif.id) return false;
		return (
			<div className='views formItem' key='views'>
				<label>views</label>
				<div className='content'>{Number(this.state.gif.views).toLocaleString('en')}</div>
			</div>
		);
	},
	renderCreated : function(){
		if(!this.state.gif.id) return false;
		return (
			<div className='created formItem' key='created'>
				<label>created</label>
				<div className='content'>{moment(this.state.gif.created).fromNow()}</div>
			</div>
		);
	},
	renderFavit : function(){
		if(!this.state.loggedinUser) return null;
		return <div className='favIt' onClick={this.handleFavClick}>
			<i className={cx('fa', {
				'fa-heart' : this.isFav(),
				'fa-heart-o' : !this.isFav()
			})} />
		</div>
	},
	renderDeleteButton : function(){
		if(!this.state.gif.id) return null;

		if(GifStore.getUser() !== 'admin') return null;


		return (
			<div className='deleteButton' onClick={this.handleDelete} data-tooltip-right='Delete this gif'>
				<i className='fa fa-trash' />
			</div>
		)
	},
	renderSaveButton : function(){
		var isEditMode = !!this.state.gif.id;
		var isSaving = this.state.status.saving;

		var text = 'save';
		if(isEditMode) text = 'update';
		if(isSaving) text = 'saving...';

		return (
			<button className={cx('save', {'create' : !isEditMode, 'update' : isEditMode})} disabled={!this.isValid()} onClick={this.handleSave}>
				<i className={cx('fa', {
					'fa-save' : !isEditMode && !isSaving,
					'fa-wrench' : isEditMode && !isSaving,
					'fa-spinner fa-spin' : isSaving
				})} />
				{text}
			</button>
		);
	},



	render : function(){
		var self = this;
		var gif = this.state.gif;


		var backgroundImage = randomBucketImg;
		if(gif.originalLink) backgroundImage = gif.originalLink;
		if(gif.gifLink) backgroundImage = gif.gifLink;

		//TODO : Gotta figure out error handler
		//console.log(JSON.parse(this.state.status.errors.body.response.text).data.error);

		var imageContainer = <div
			className={cx('imageContainer', {filler : (!gif.originalLink && !gif.gifLink)})}
			style={{backgroundImage : "url('" + backgroundImage + "')" }} />


		return(
			<div className='gifForm'>
				<div className='imageSide '>
					{this.renderFavit()}
					{imageContainer}
				</div>

				<div className='dataSide'>
					<div className='link formItem' key='link'>
						<label>link</label>
						{this.renderLink()}
					</div>

					<div className='bucket formItem' key='bucket'>
						<label>bucket</label>
						<BucketSelect selectedBuckets={gif.buckets} onChange={this.handleBucketChange} />
					</div>

					<div className='tags formItem' key='tags'>
						<label>tags</label>
						<textarea
							className='tags'
							value={gif.tags}
							placeholder={this.props.placeholder}
							onChange={this.handleTagChange} />
					</div>

					{this.renderViews()}
					{this.renderCreated()}


					<div className='user formItem' key='user'>
						{this.renderUser()}
					</div>

					<div className='control formItem' key='control'>
						{this.renderDeleteButton()}
						{this.renderSaveButton()}
						{this.state.status.errors}
					</div>
				</div>
			</div>
		);
	}
});

module.exports = GifForm;


