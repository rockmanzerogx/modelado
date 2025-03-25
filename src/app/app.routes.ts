import { Routes } from '@angular/router';
import { CuadradoComponent } from './page/cuadrado/cuadrado.component';
import { ProductoComponent } from './page/producto/producto.component';
import { LinealComponent } from './page/lineal/lineal.component';
import { MultiplicativoComponent } from './page/multiplicativo/multiplicativo.component';

export const routes: Routes = [
    {path: 'cuadrado', component: CuadradoComponent},
    {path: 'producto', component: ProductoComponent},
    {path: 'lineal', component: LinealComponent},
    {path: 'multiplicativo', component: MultiplicativoComponent},
    {path: '', redirectTo: '/cuadrado', pathMatch: 'full'},
    //{path: '**', component: PageNotFoundComponent}

];
