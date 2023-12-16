import {
	handleIncomingRedirect,
	fetch,
	getDefaultSession,
	login,
	logout
} from '@inrupt/solid-client-authn-browser';
import {
	createSolidDataset,
	createThing,
	getSolidDataset,
	getThing,
	getThingAll,
	getStringNoLocale,
	removeThing,
	saveSolidDatasetAt,
	setThing,
	buildThing,
	getUrl,
	type SolidDataset
} from '@inrupt/solid-client';
import { get, writable, type Writable } from 'svelte/store';
import { page } from '$app/stores';
import * as LinkHeader from 'http-link-header';

type Contact = {
	id: string;
	imageUrl: string | null;
	name: string;
	phoneNumber: string;
	email: string;
	company: string;
	jobTitle: string;
};

function returnEmptyContact() {
	const contact: Contact = {
		id: '',
		imageUrl: '',
		name: '',
		phoneNumber: '',
		email: '',
		company: '',
		jobTitle: ''
	};
	return contact;
}

// This function begins the login process
// It takes oidcIssuer which is the provider to log into
// Also takes a path to redirect to, which will be the app route
async function startLogin(oidcIssuer: string, redirectPath: string) {
	// Start the Login Process if not already logged in.
	if (!getDefaultSession().info.isLoggedIn) {
		await login({
			oidcIssuer: oidcIssuer,
			redirectUrl: new URL(redirectPath, get(page).url).toString(),
			clientName: 'Solid Contacts'
		});
	}
	// If already logged in then redirect immediately 
	else {
		window.location.href = '/app';
	}
}

// This function was taken from https://github.com/SolidLabResearch/Bashlib/blob/ade106e8baba6a72b73e28da10f20ee18285b44a/src/utils/util.ts#L68C1-L99
// Default solid function for getting PodUrl doesn't work with community server but this function is recommended as spec compliant alternative
// I copied instead of using the library as the library isn't compatible with the correct node version
async function getPodRoot(url: string): Promise<string | null> {

	// Check current resource header
	const res = await fetch(url, { method: "HEAD" })

	if (!res.ok) return null // throw new Error(`HTTP Error Response requesting ${url}: ${res.status} ${res.statusText}`);
	let linkHeaders;
	if (res.ok) linkHeaders = res.headers.get('Link')
	if (linkHeaders) {
		const headers = LinkHeader.parse(linkHeaders)
		for (const header of headers.refs) {
			if (header.uri === 'http://www.w3.org/ns/pim/space#Storage' && header.rel === 'type') {
				return url.endsWith('/') ? url : url + '/';
			}
		}
	}

	// Check current resource for link
	try {
		const ds = await getSolidDataset(url)
		const thing = ds && getThing(ds, url)
		const storageUrl = thing && getUrl(thing, 'http://www.w3.org/ns/pim/space#storage')
		if (storageUrl) return storageUrl;
	} catch { }

	const splitUrl = url.split('/')
	const index = url.endsWith('/') ? splitUrl.length - 2 : splitUrl.length - 1
	const nextUrl = splitUrl.slice(0, index).join('/') + '/'

	return getPodRoot(nextUrl)
}

async function getPodUrl() {
	return await getPodRoot(getDefaultSession().info.webId as unknown as string)
}

// This function ends the login process
async function completeLogin() {
	// Handle the redirect from the pod provider to finish login
	const handler = await handleIncomingRedirect({ restorePreviousSession: true });
	// If the user is not logged in then go back to the main page
	// Important for when app route is accessed directly without logging in
	if (handler == undefined || handler.isLoggedIn == false) {
		window.location.href = '/';
	}
	// Figure out where the users pod is stored
	const podUrl = await getPodUrl();
	// If there is no pod then go back to the main page
	if (podUrl == null) {
		window.location.href = '/';
	}
	// Otherwise save the pod contacts path for easy usage
	else {
		contactsUrl = podUrl + 'vCardContacts/example.ttl'
	}
	// Establish that pod contacts path exists, if not then make it
	await establishContactsUrl()
	// Fetch the contacts from the pod to update the table
	await refreshContactsState()
}

async function startLogout() {
	logout();
	window.location.href = '/';
}

// This function establishes that contacts already exist in the pod
// If they don't then the contacts location is created
async function establishContactsUrl() {
	// Try to get the solid dataset from the expected path
	try {
		myDataset = await getSolidDataset(
			contactsUrl,
			{ fetch: fetch }
		);
	}
	// If path doesn't exist, create it
	catch {
		await saveSolidDatasetAt(
			contactsUrl,
			createSolidDataset(),
			{ fetch: fetch }
		);
	}
}

// This function fetches the contacts from the pod to update the table
async function refreshContactsState() {
	try {
		const refreshedDataset = await getSolidDataset(
			contactsUrl,
			{ fetch: fetch } // fetch function from authenticated session
		)
		await updateContactsState(refreshedDataset)
	}
	catch(err) {
		console.log(err)
	}
}

// This function takes a dataset to update the table with
async function updateContactsState(dataset: SolidDataset) {
	// Create an array of Contacts
	const array = new Array<Contact>();
	// For each contact in the dataset, add contact object to the array
	getThingAll(dataset).forEach(element => {
		const contact: Contact = {
			id: element.url,
			imageUrl: null,
			name: getStringNoLocale(element, "http://www.w3.org/2006/vcard/ns#fn") as string,
			phoneNumber: (getUrl(element, "http://www.w3.org/2006/vcard/ns#hasTelephone") as string).slice(4),
			email: (getUrl(element, "http://www.w3.org/2006/vcard/ns#hasEmail") as string).slice(7),
			company: getStringNoLocale(element, "http://www.w3.org/2006/vcard/ns#organization-name") as string,
			jobTitle: getStringNoLocale(element, "http://www.w3.org/2006/vcard/ns#title") as string
		}
		array.push(contact)
	});
	// Use newly made contact array to update tables data
	contacts.set(array);
}

// This function creates a contact in the pod from a contact object
// Then it updates the table with the new data
async function createContactInPod(contact: Contact) {
	// Create a 'Thing' for the pod with the contact data
	const contactThing = buildThing(createThing())
		.addStringNoLocale("http://www.w3.org/2006/vcard/ns#fn", contact.name)
		.addStringNoLocale("http://www.w3.org/2006/vcard/ns#organization-name", contact.company)
		.addStringNoLocale("http://www.w3.org/2006/vcard/ns#title", contact.jobTitle)
		.addUrl("http://www.w3.org/2006/vcard/ns#hasTelephone", "tel:" + contact.phoneNumber)
		.addUrl("http://www.w3.org/2006/vcard/ns#hasEmail", "mailto:" + contact.email)
		.build();
	// Add the new contact 'Thing' to the local dataset
	myDataset = setThing(myDataset, contactThing);
	// Save the contact 'Thing' into the pod
	// Return value is saved as it is an updated local dataset
	try {
		myDataset = await saveSolidDatasetAt(
			contactsUrl,
			myDataset,
			{ fetch: fetch }
		);
		// Update the local contacts array with updated dataset
		await updateContactsState(myDataset);
	}
	catch(err) {
		console.log(err)
	}
}

// This function edits a contact in the pod
// Then it updates the table with the new data
async function editContactInPod(key: number, contact: Contact) {
	// Create a 'Thing' for the pod with the contact data, this time specifying the contacts id from the table
	const contactThing = buildThing(createThing({ url: get(contacts)[key].id }))
		.addStringNoLocale("http://www.w3.org/2006/vcard/ns#fn", contact.name)
		.addStringNoLocale("http://www.w3.org/2006/vcard/ns#organization-name", contact.company)
		.addStringNoLocale("http://www.w3.org/2006/vcard/ns#title", contact.jobTitle)
		.addUrl("http://www.w3.org/2006/vcard/ns#hasTelephone", "tel:" + contact.phoneNumber)
		.addUrl("http://www.w3.org/2006/vcard/ns#hasEmail", "mailto:" + contact.email)
		.build();
	// Add the new contact 'Thing' to the local dataset
	myDataset = setThing(myDataset, contactThing);
	// Save the contact 'Thing' into the pod
	// Return value is saved as it is an updated local dataset
	try {
		myDataset = await saveSolidDatasetAt(
			contactsUrl,
			myDataset,
			{ fetch: fetch }
		);
		// Update the local contacts array with updated dataset
		await updateContactsState(myDataset);
	}
	catch(err) {
		console.log(err)
	}
}

// This function removes a contact from the pod usings its id
async function removeContactsInPod(keys: string[]) {
	// Remove the contact with the specified id from the local dataset
	keys.forEach(key => {
		myDataset = removeThing(myDataset, get(contacts)[key as unknown as number].id);
	})
	// Remove the contact 'Thing' from the pod
	// Return value is saved as it is an updated local dataset
	try {
		myDataset = await saveSolidDatasetAt(
			contactsUrl,
			myDataset,
			{ fetch: fetch }
		);
		// Update the local contacts array with updated dataset
		await updateContactsState(myDataset);
	}
	catch(err) {
		console.log(err)
	}
}

// Allows functions/types in this file become accessible in other files if needed
export {
	startLogin,
	completeLogin,
	startLogout,
	updateContactsState,
	createContactInPod,
	removeContactsInPod,
	editContactInPod,
	returnEmptyContact,
	refreshContactsState
};
export type { Contact };

// These variables are used throughout this script for consistent access
export const contacts: Writable<Contact[]> = writable(new Array<Contact>());
let myDataset: SolidDataset;
let contactsUrl: string;