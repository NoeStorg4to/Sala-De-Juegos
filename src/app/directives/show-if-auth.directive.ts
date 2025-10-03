import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[showIfAuth]',
    standalone: true
})
export class ShowIfAuthDirective implements OnInit, OnDestroy {
    private authSubscription!: Subscription;
    private hasView = false;
    private shouldShowWhenAuth = true;

    @Input() set showIfAuth(shouldShow: boolean) {
        this.shouldShowWhenAuth = shouldShow;
    }

    constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef, private authService: AuthService) {}

    ngOnInit() {
        this.authSubscription = this.authService.authState$.subscribe(authState => {
        const isAuthenticated = !!authState.user;

        const shouldDisplay = this.shouldShowWhenAuth === isAuthenticated;
        this.updateView(shouldDisplay);
        });
    }

    private updateView(shouldDisplay: boolean) {
        if (shouldDisplay && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!shouldDisplay && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }
}