import React, { Component } from 'react';
import fire from './../fire.js';

class League extends Component {
	constructor(props) {
    	super(props);
    	
    	this.state = {
			league: {}
		};
		
		this.leagueID = props.match.params.id;
		/* Create reference to messages in Firebase Database */
    	this.league = fire.database().ref('leagues/list').orderByChild("leagueID").equalTo(this.leagueID * 1);
  	}	

    fetch() {
        this.league.on('value', snapshot => {            
            console.log(snapshot.val());
            if (snapshot.val()) {
                this.setState({ league: snapshot.val()['_' + this.leagueID] });
            }
        });
    }

    componentDidMount() {
        this.fetch();
    }

    componentWillUnmount() {
        this.league.off('value');
    }

	render() {	    
	    const { league } = this.state;

	    return (<h3>{league.title}</h3>);
	}
}


export default League;